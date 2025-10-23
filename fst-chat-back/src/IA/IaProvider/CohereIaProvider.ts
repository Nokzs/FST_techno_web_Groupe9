import { IIaProvider } from './IiaProvider';
import { ConfigService } from '@nestjs/config';
import { CohereClient, CohereClientV2 } from 'cohere-ai';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CohereIaProvider implements IIaProvider {
  private readonly cohere: CohereClient;
  private readonly cohereV2: CohereClientV2;
  constructor(private readonly configService: ConfigService) {
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

  async embed(text: string): Promise<number[] | null> {
    const response = await this.cohere.v2.chat({
      model: 'command-a-03-2025',
      messages: [
        {
          role: 'user',
          content:
            "Corrige les fautes d'orthographe et reformule le texte pour qu'il soit clair, sans changer le sens" +
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
}
