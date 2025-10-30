import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { AuthGuard } from '../guards/authGuard';
import type { IIaProvider } from './IaProvider/IiaProvider';

type CommandHandler = (content: string) => Promise<string>;

interface AskBody {
  command: string;
  channelId: string;
  userId: string;
  language: string;
  useUserLanguage: boolean;
}

@Controller('/chatBot')
export class ChatBotController {
  constructor(@Inject('IA_PROVIDER') private readonly iaService: IIaProvider) {}

  @Post('/command')
  @UseGuards(AuthGuard)
  async chatBotCommand(@Body() body: AskBody): Promise<string> {
    const { command, channelId, userId, language, useUserLanguage } = body;

    // 1️⃣ Parser la commande via le LLM
    const userCommand = await this.iaService.parseCommand(command, language);

    const jsonCommand = JSON.parse(userCommand) as {
      type: string;
      content: string;
      lang?: string;
    };
    // 2️⃣ Définir les stratégies de traitement par type de commande
    const commandStrategies: Record<string, CommandHandler> = {
      question: async (content: string): Promise<string> =>
        this.iaService.ask(
          content,
          channelId,
          userId,
          language,
          useUserLanguage,
          jsonCommand.lang
        ),

      summarize: async (content: string): Promise<string> =>
        this.iaService.makeSummary(
          content,
          channelId,
          userId,
          language,
          jsonCommand?.lang,
          useUserLanguage
        ),

      unknown: async (content: string): Promise<string> => content, // retourne directement le texte
    };

    const handler =
      commandStrategies[jsonCommand.type] ?? commandStrategies['unknown'];
    try {
      const answer = await handler(jsonCommand.content);
      return answer;
    } catch (error) {
      Logger.error('Erreur lors du traitement de la commande:', error);
      return '';
    }
  }
}
