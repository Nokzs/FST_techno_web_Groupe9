import { IIaProvider } from './IiaProvider';
import { ConfigService } from '@nestjs/config';
import { CohereClient, CohereClientV2 } from 'cohere-ai';
import { Injectable, Logger } from '@nestjs/common';
import { Message, MessageDocument } from '../../message/schema/message.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CacheService,
  type QuestionCache,
  type Answer,
} from '../../cache/service/Cache.service';

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
    const prompt = `
Instructions :
1. Réponds uniquement par le texte corrigé et traduit en anglais.
2. Vérifie les fautes d’orthographe.
3. Reformule pour que ce soit clair et naturel en anglais.
4. Ne change pas le sens.

---

Texte à traduire :
${text}
`;
    const response = await this.cohere.v2.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content: prompt,
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
    detectedLanguage: string
  ): Promise<string> {
    if (!channelId) throw new Error('channelId is required');

    //Calculer l'embedding de la question
    const questionEmbedding = await this.embed(question);
    if (!questionEmbedding)
      throw new Error("Impossible de générer l'embedding de la question.");

    const cachedAnswers: QuestionCache[] =
      await this.cacheService.getCachedAnswers(channelId);

    Logger.log(
      `Vérification du cache pour ${cachedAnswers.length} réponses en cache... pour le channel ${channelId}`
    );
    // 2️⃣ Vérifier le cache
    for (const cacheEntry of cachedAnswers) {
      const similarity = this.cosineSimilarity(
        questionEmbedding,
        cacheEntry.embedding,
        cacheEntry.norm
      );

      if (similarity > this.similarityThreshold) {
        const localized: Answer | undefined = cacheEntry.answer.find(
          (a) => a.lang === (useUserLanguage ? lang : detectedLanguage)
        );
        if (localized) {
          return localized.answer; // version dans la langue de l'utilisateur
        }

        // Traduire la première réponse disponible
        const translated = await this.translate(
          cacheEntry.answer[0].answer,
          useUserLanguage ? lang : detectedLanguage
        );

        // Mettre à jour le cache avec la nouvelle langue
        await this.cacheService.cacheAnswer(
          channelId,
          translated,
          useUserLanguage ? lang : detectedLanguage,
          cacheEntry.embedding
        );

        return translated;
      }
    }
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

    const prompt = `
Contexte (messages pertinents) :
${contextText}

Informations sur l'utilisateur (moi) :
- ID : ${userId}

Texte utilisateur :
${question}

Instructions :
1. Réponds aux questions **en rapport avec la discussion ou les utilisateurs mentionnés**, y compris l'utilisateur lui-même.
2. Si la question est en rapport avec le contexte, répond de manière concise et utile.
3. Si le texte n'est pas une question ou ne peut pas être répondu à partir du contexte, répond par :
   "Je ne peux répondre qu'aux questions pertinentes pour la discussion."
4. Ne fabrique pas d’informations qui ne sont pas dans le contexte ou les informations utilisateur.
5. Répond strictement sous la forme d'un JSON avec les clés suivantes :
{
  "answer": "la réponse basée sur le contexte et les infos utilisateur",
  "translateAnswer": "la réponse en anglais",
  "lang": "la langue de la réponse"
}
`;
    // 7️⃣ Appeler le LLM
    const answerLLM = await this.prompt(prompt);
    if (!answerLLM) {
      throw new Error("Le modèle de langage n'a pas pu générer de réponse.");
    }

    const parsedAnswer = JSON.parse(
      answerLLM
        .replace(/^```json\s*/i, '')
        .replace(/```$/i, '')
        .trim()
    ) as { answer: string; translateAnswer: string };

    this.cacheService
      .cacheAnswer(
        channelId,
        parsedAnswer.answer,
        useUserLanguage ? lang : detectedLanguage,
        questionEmbedding
      )
      .catch((err) => {
        console.error('Erreur lors de la mise en cache de la réponse :', err);
      });
    return parsedAnswer.answer;
  }
  /**
   * @description Extrait une date au format ISO 8601 à partir d'une chaîne de caractères en utilisant un modèle de langage.
   */
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
Considère que ${userId}, c’est moi.

Voici des messages issus d’une discussion :
${textToSummarize}

Ta tâche :
- Ne fais pas un résumé chronologique message par message.
- Analyse et regroupe les échanges pour en dégager les **grandes idées, thèmes ou décisions**.
- Identifie clairement les participants :
  • Si tu trouves des **prénoms**, utilise-les.  
  • Sinon, utilise leurs **pseudos** (jamais les user IDs).  
  • Si aucun nom n’est identifiable, utilise une désignation cohérente (ex. "Participant A", "Participant B").
- Pour chaque idée importante, indique **qui a exprimé quoi**, de manière fluide et naturelle.
- Rédige un **résumé conceptuel**, synthétique et clair, centré sur les **idées, positions, arguments et décisions**.
- Structure le texte de manière **lisible et hiérarchisée**, avec :
  • **Thèmes / idées principales**
  • **Sous-sections** (*Contexte*, *Participants*, *Points clés / Discussion*, *Décision / Conclusion*)  
  • **Sauts de ligne** pour aérer le texte et faciliter la lecture.

Format attendu :
============================================================
🟢 **[Thème ou idée principale]**

*Contexte*  
[Brève description du sujet et du contexte]

*Participants*  
[Prénom ou pseudo 1 — sa position ou idée principale ; Prénom ou pseudo 2 — sa réponse ou avis, etc.]

*Points clés / Discussion*  
[Résumé des échanges principaux, arguments et positions de chacun]

*Décision / Conclusion*  
[Résultat ou état final du point, si applicable]

🟢 **[Thème ou idée suivante]**
*Contexte*  
[idem ci-dessus]

*Participants*  
[idem ci-dessus]

*Points clés / Discussion*  
[idem ci-dessus]

*Décision / Conclusion*  
[idem ci-dessus]

📘 **Synthèse finale**  
[Résumé global de la discussion : principaux accords, désaccords, orientations ou points à approfondir]

============================================================

- Le texte doit rester **fluide, structuré, hiérarchisé, et agréable à lire**, avec **sauts de ligne**.  
- Langue de réponse : ${useUserLanguage ? lang : detectedLanguage}.
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
Tu es un assistant qui transforme une phrase utilisateur en commande JSON.

Patterns :

1. /question
   - Si la phrase commence strictement par "/question", renvoie :
     {
       "type": "question",
       "content": "le reste de la phrase après /question",
       "lang": "${language}"
     }
   - Si le reste est vide, renvoie :
     {
       "type": "unknown",
       "content": "Traduction en ${language} de 'Veuillez poser une question après la commande /question'"
     }

2. /summarize
   - Si la phrase commence strictement par "/summarize", renvoie :
     {
       "type": "summarize",
       "content": "le reste de la phrase après /summarize",
       "lang": "la langue détectée ou null"
     }

3. Aucun pattern reconnu
   - Renvoie :
     {
       "type": "unknown",
       "content": "La commande n'a pas été reconnue (traduite automatiquement en ${language})"
     }

Phrase utilisateur : "${command}"

⚠️ Répond uniquement par **l'objet JSON**, sans texte supplémentaire.
`;

    const answer = await this.prompt(promptLLm);
    if (!answer) {
      throw new Error('Impossible de parser la commande.');
    }
    return answer
      .replace(/^```json\s*/i, '')
      .replace(/```$/i, '')
      .trim();
  }
  private async translate(text: string, targetLang: string): Promise<string> {
    const prompt = `
  Tu es un assistant de traduction.
  Traduits le texte suivant en ${targetLang} de manière naturelle et fluide.
    Texte : ${text} `;
    const translatedText = await this.prompt(prompt);
    if (!translatedText) {
      throw new Error('Impossible de traduire le texte.');
    }
    return translatedText;
  }
}
