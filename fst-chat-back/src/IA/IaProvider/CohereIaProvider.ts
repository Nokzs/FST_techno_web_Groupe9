import { IIaProvider } from './IiaProvider';
import { ConfigService } from '@nestjs/config';
import { CohereClient, CohereClientV2 } from 'cohere-ai';
import { Injectable, Logger } from '@nestjs/common';
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
    userId: string,
    lang: string,
    useUserLanguage = true,
    detectedLanguage?: string
  ): Promise<string> {
    if (!channelId) throw new Error('channelId is required');

    //Calculer l'embedding de la question
    const questionEmbedding = await this.embed(question);
    if (!questionEmbedding)
      throw new Error("Impossible de générer l'embedding de la question.");

    // On vérifie qu'il n'y a pas une réponse en cache pour cette question
    // pour cela on calcule la similarité cosine entre l'embedding de la question et les embeddings des question en cache
    const cachedAnswers = await this.cacheService.getCachedAnswers(channelId);
    for (const answer of cachedAnswers) {
      const similarity = this.cosineSimilarity(
        questionEmbedding,
        answer.embedding,
        answer.norm
      );
      if (similarity > this.similarityThreshold) {
        return answer.answer;
      }
    } // 1️⃣ Récupérer tous les messages du channel
    const messages = await this.messageModel
      .find({ channelId })
      .populate('senderId', 'pseudo _id')
      .exec();

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
      Réponds de manière concise en langue: ${useUserLanguage ? lang : detectedLanguage} en répondant simplement uniquement en te basant sur le contexte ci-dessus. 
      Si tu n'as pas assez d'informations dans le contexte, réponds que tu n'as pas assez d'informations pour répondre à la question toujours dans la même langue.
      réponds sous la forme suivante :
      sous la forme strict d'un JSON avec :
        "answer": la réponse à la question',
        "translateAnswer":  la réponse en anglais (même si la question est en anglais)
      `;

    // 7️⃣ Appeler le LLM
    const answerLLM = await this.prompt(prompt);
    if (!answerLLM) {
      throw new Error("Le modèle de langage n'a pas pu générer de réponse.");
    }

    // 8️⃣ Mettre en cache la réponse en cas de question similaire
    this.cacheService
      .cacheAnswer(channelId, answerLLM, questionEmbedding)
      .catch((err) => {
        console.error('Erreur lors de la mise en cache de la réponse :', err);
      });
    return answerLLM;
  }

  private async getDatefromString(
    dateString: string,
    lang: string,
    detectedLanguage: string,
    useUserLanguage: boolean
  ): Promise<Date | string> {
    const prompt = `
Tu es un assistant qui convertit une expression de date humaine en format ISO 8601.
Si la phrase ne contient pas de date, réponds que tu ne peux pas determiner de date dans la langue : ${useUserLanguage ? lang : detectedLanguage} .
sinon réponds qu'avec la date ISO, sans texte supplémentaire.

Exemples :
- "hier" -> "2025-10-25"
- "le 12 mars" -> "2025-03-12"
- "depuis 3 jours" -> "2025-10-23"
- "ayer por la noche" -> "2025-10-25"
- "yesterday evening" -> "2025-10-25"

Texte : ${dateString}
`;
    const text = await this.prompt(prompt);
    if (!text) {
      throw new Error('Impossible de générer la date.');
    }
    // On valide le format ISO 8601
    const match = text.match(/^\d{4}-\d{2}-\d{2}/);
    if (!match) return text;

    const parsedDate = new Date(match[0]);
    return isNaN(parsedDate.getTime()) ? text : parsedDate;
  }

  async makeSummary(
    content: string,
    channelId: string,
    userId: string,
    lang: string,
    detectedLanguage?: string,
    useUserLanguage = true
  ): Promise<string> {
    const date: Date | string = await this.getDatefromString(
      content,
      lang,
      detectedLanguage || lang, //si la langue n'a pas été détectée, on utilise la langue de l'utilisateur
      useUserLanguage
    );
    if (!date) {
      return "Désolé, je n'ai pas pu comprendre la date fournie.";
    }
    // 2️⃣ Récupération des messages principaux (depuis la date)
    const messagesAfter = await this.messageModel
      .find({ createdAt: { $gte: date }, channelId })
      .populate('senderId', 'pseudo _id')
      .exec();

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
considère que ${userId}, c'est moi.
Voici quelques messages de contexte suivis des messages à résumer :
${textToSummarize}

Résume-les de manière concise et claire.
Réponds en langue: ${useUserLanguage ? lang : detectedLanguage}.
`;
    const sumarize = await this.prompt(prompt);
    if (!sumarize) {
      throw new Error("Désolé, je n'ai pas pu générer de résumé.");
    }
    return sumarize;
  }
  async parseCommand(command: string, language: string): Promise<string> {
    console.log('Parsing command:', command, 'for language:', language);
    const promptLLm = `
        Tu es un assistant qui extrait la commande principale d'une phrase utilisateur.
        Les patterns sont les suivants :

        1. Si la commande commence par /question :
          - Renvoie un objet JSON strict sous la forme :
            {
              "type": "question",
              "content": "le reste de la phrase après /question",
              "lang": "la langue de la question (fr, en, es...)"
            } 
          - si le reste de la phrase est vide, mets "content" la traduction en ${language} de "Veuillez poser une question après la commande /question"
        2. Si la commande commence par /summarize :
          - Renvoie un objet JSON strict sous la forme :
            {
              "type": "summarize",
              "content": "le reste de la phrase après /summarize"
              "lang": "la langue detecté" si tu arrives à détecter la langue remplace par null
            }

        3. Si aucun pattern n'est reconnu :
          - Renvoie un objet JSON strict sous la forme :
            {
              "type": "unknown",
              "content": "La commande n'a pas été reconnue"
            }
          - Traduits **automatiquement** le texte de "content" dans la langue de l'utilisateur, qui est : ${language}.

        Phrase utilisateur : "${command}"
        Répond uniquement par l'objet JSON correspondant.
`;

    const answer = await this.prompt(promptLLm);
    Logger.log('Parsed command answer: ', answer);
    if (!answer) {
      throw new Error('Impossible de parser la commande.');
    }
    return answer
      .replace(/^```json\s*/i, '')
      .replace(/```$/i, '')
      .trim();
  }
}
