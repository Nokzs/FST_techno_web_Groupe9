import { IIaProvider } from './IiaProvider';
import { ConfigService } from '@nestjs/config';
import { CohereClient, CohereClientV2 } from 'cohere-ai';
import { Injectable } from '@nestjs/common';
import { Message, MessageDocument } from '../../message/schema/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CacheService, QuestionCache } from '../../cache/service/Cache.service';

@Injectable()
export class CohereIaProvider implements IIaProvider {
  private readonly cohere: CohereClient;
  private readonly cohereV2: CohereClientV2;
  private readonly similarityThreshold = 0.92;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly cacheService: CacheService
  ) {
    const api_key = this.configService.get<string>('COHERE_API_KEY', '');
    if (!api_key) {
      throw new Error('Cohere API key is not defined in environment variables');
    }
    this.cohere = new CohereClient({
      token: api_key,
    });
    this.cohereV2 = new CohereClientV2({
      token: api_key,
    });
  }
  async prompt(prompt: string): Promise<string | null> {
    // 7️⃣ Appeler le LLM
    const answerLLM = await this.cohere.v2.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    if (!answerLLM.message || !answerLLM.message.content) {
      return null;
    }

    if (
      !answerLLM.message?.content?.length ||
      answerLLM.message.content[0].type !== 'text'
    ) {
      return null;
    }

    return answerLLM.message.content[0].text;
  }
  async embed(text: string): Promise<number[] | null> {
    const response = await this.cohere.v2.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content:
            "Corrige les fautes d'orthographe et reformule le texte pour qu'il soit clair en anglais, sans changer le sens \n" +
            text,
        },
      ],
    });

    if (!response.message || !response.message.content) {
      return null;
    }
    if (response.message.content[0].type !== 'text') {
      return null;
    }

    const correctedText = response.message.content[0].text;

    const embed = await this.cohere.v2.embed({
      texts: [correctedText],
      model: 'embed-v4.0',
      inputType: 'classification',
      embeddingTypes: ['float'],
    });

    const embedding = embed.embeddings.float?.[0];
    return embedding || null;
  }

  private cosineSimilarity(
    query: number[],
    messageEmbedding: number[],
    messageNorm: number // pré-calculé
  ): number {
    if (query.length !== messageEmbedding.length) {
      throw new Error('Taille des vecteurs différente');
    }
    let dot = 0;
    let normQuery = 0;

    for (let i = 0; i < query.length; i++) {
      dot += query[i] * messageEmbedding[i];
      normQuery += query[i] * query[i];
    }

    if (normQuery === 0 || messageNorm === 0) return 0;

    return dot / (Math.sqrt(normQuery) * messageNorm);
  }
  /**
   * @description Génère la réponse à une question en se basant sur les messages d'un channel spécifique.
   * @param question La question posée par l'utilisateur.
   * @param channelId L'ID du canal de chat.
   * @param userId L'ID de l'utilisateur posant la question.
   * @returns La réponse générée par le modèle de langage.
   * @summary Le fonctionnement est le suivant : on récupère tous les messages du channel, on calcule l'embedding de la question, 
     on calcule la similarité cosine entre la question et chaque message,
     on sélectionne les messages les plus pertinents, 
     on construit un prompt avec ces messages et la question,
     puis on interroge le modèle de langage pour obtenir une réponse.
   */
  async ask(
    question: string,
    channelId: string,
    userId: string
  ): Promise<string> {
    if (!channelId) throw new Error('channelId is required');

    //Calculer l'embedding de la question
    const questionEmbedding = await this.embed(question);
    if (!questionEmbedding)
      throw new Error("Impossible de générer l'embedding de la question.");

    // On vérifie qu'il n'y a pas une réponse en cache pour cette question
    // pour cela on calcule la similarité cosine entre l'embedding de la question et les embeddings des question en cache
    const cachedAnswers = await this.cacheService.getCachedAnswers(channelId);
    cachedAnswers.forEach((answer: QuestionCache) => {
      if (
        this.cosineSimilarity(
          questionEmbedding,
          answer.embedding,
          answer.norm
        ) > this.similarityThreshold
      )
        return answer.answer;
    });
    if (cachedAnswers.length > 0) {
      return cachedAnswers[0].answer;
    }
    // 1️⃣ Récupérer tous les messages du channel
    const messages = await this.messageModel
      .find({ channelId })
      .populate('senderId', 'pseudo _id')
      .exec();

    if (!messages.length) return 'Aucun message trouvé dans ce channel.';

    // 2️⃣ Calculer l'embedding de la question
    // 3️⃣ Calculer la similarité cosine entre question et chaque message
    const messagesWithScore = messages.map((msg) => {
      const score = this.cosineSimilarity(
        questionEmbedding,
        msg.embedding,
        msg.embeddingNorm
      );
      return { msg, score };
    });

    messagesWithScore.sort((a, b) => b.score - a.score);

    const topX = 20;
    const prevMessages = 5;
    const topMessagesWithContext: {
      messages: string;
      user: { _id: string; pseudo: string };
    }[] = [];

    const topScoreThreshold = 0.2; // seuil à ajuster selon tes embeddings
    if (messagesWithScore[0].score < topScoreThreshold) {
      return "Désolé, je n'ai pas assez d'informations pour répondre à cette question.";
    }
    for (const item of messagesWithScore.slice(0, topX)) {
      const idx = messages.findIndex((m) => m._id === item.msg._id);
      if (idx === -1) continue;

      const startIdx = Math.max(0, idx - prevMessages);
      for (let i = startIdx; i <= idx; i++) {
        topMessagesWithContext.push({
          messages: messages[i].content,
          //pas le meilleur cast mais fonctionne
          user: messages[i].senderId as unknown as {
            _id: string;
            pseudo: string;
          },
        });
      }
    }

    // Supprimer les doublons pour ne pas répéter les mêmes messages
    const uniqueTopMessages = Array.from(
      new Map(
        topMessagesWithContext.map((m) => [m.messages + m.user._id, m])
      ).values()
    );
    const contextText = uniqueTopMessages
      .map((m, i) => {
        const content =
          m.messages.length > 500
            ? m.messages.slice(0, 500) + '...'
            : m.messages;
        return `${i + 1}. [${m.user.pseudo}] ${content}`;
      })
      .join('\n');
    // 6️⃣ Construire le prompt pour le LLM
    const prompt = `
      Contexte (messages pertinents) :
      ${contextText}

      Question : ${question}

      considère que ${userId}, c'est moi'
      Réponds de manière concise dans la langue de la question en répondant simplement uniquement en te basant sur le contexte ci-dessus. 
      Si tu n'as pas assez d'informations dans le contexte, réponds que tu n'as pas assez d'informations pour répondre à la question.
      `;

    // 7️⃣ Appeler le LLM
    const answerLLM = await this.prompt(prompt);
    return !answerLLM
      ? "Désolé, je n'ai pas pu générer de réponse."
      : answerLLM;
  }

  private async getDatefromString(dateString: string): Promise<Date | null> {
    const prompt = `
Tu es un assistant qui convertit une expression de date humaine en format ISO 8601.
Si la phrase ne contient pas de date, réponds "null".
Ne réponds qu'avec la date ISO, sans texte supplémentaire.

Exemples :
- "hier" -> "2025-10-25"
- "le 12 mars" -> "2025-03-12"
- "depuis 3 jours" -> "2025-10-23"
- "ayer por la noche" -> "2025-10-25"
- "yesterday evening" -> "2025-10-25"

Texte : ${dateString}
`;
    const text = await this.prompt(prompt);
    if (!text) return null;
    // On valide le format ISO 8601
    const match = text.match(/^\d{4}-\d{2}-\d{2}/);
    if (!match) return null;

    const parsedDate = new Date(match[0]);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  async makeSummarize(dateString: string): Promise<string> {
    const date: Date | null = await this.getDatefromString(dateString);
    if (!date) {
      return "Désolé, je n'ai pas pu comprendre la date fournie.";
    }
    // 2️⃣ Récupération des messages principaux (depuis la date)
    const messagesAfter = await this.messageModel
      .find({ createdAt: { $gte: date } })
      .populate('senderId', 'pseudo _id')
      .exec();

    // 3️⃣ Récupération des messages avant la date pour contexte
    const messagesBefore = await this.messageModel
      .find({ createdAt: { $lt: date } })
      .sort({ createdAt: -1 }) // derniers messages avant la date
      .limit(10)
      .populate('senderId', 'pseudo _id')
      .exec();

    // 4️⃣ Concaténation du contexte et des messages principaux
    const textToSummarize = [
      ...messagesBefore
        .reverse()
        .map((m) => {
          const sender = m.senderId as unknown as {
            pseudo: string;
            _id: string;
          };
          return `[${sender.pseudo}(${sender._id})]: ${m.content?.trim()}`;
        })
        .filter(Boolean),
      ...messagesAfter
        .map((m) => {
          const sender = m.senderId as unknown as {
            pseudo: string;
            _id: string;
          };
          return `[${sender.pseudo}(${sender._id})]: ${m.content?.trim()}`;
        })
        .filter(Boolean),
    ].join('\n');

    if (!textToSummarize) {
      return 'Aucun contenu à résumer.';
    }
    const prompt = `
Voici quelques messages de contexte suivis des messages à résumer :
${textToSummarize}

Résume-les de manière concise et claire.
`;
    const sumarize = await this.prompt(prompt);
    if (!sumarize) {
      return "Désolé, je n'ai pas pu générer de résumé.";
    }
  }
}
