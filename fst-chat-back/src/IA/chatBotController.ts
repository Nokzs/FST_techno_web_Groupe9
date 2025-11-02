import {
  Controller,
  Post,
  Body,
  Logger,
  UseGuards,
  Inject,
  ServiceUnavailableException,
} from '@nestjs/common';
import { AuthGuard } from '../guards/authGuard';
import type { IIaProvider } from './IaProvider/IiaProvider';
import { AskBodyDto } from './DTO/askDto';
import {
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
type CommandHandler = (content: string) => Promise<string>;
@ApiTags('chatBot')
@Controller('/chatBot')
export class ChatBotController {
  constructor(@Inject('IA_PROVIDER') private readonly iaService: IIaProvider) {}

  @ApiOperation({
    description:
      "route de récéption d'une commande  et de l'envoie de la réponse",
  })
  @ApiUnauthorizedResponse({
    description: 'token manquant ou invalide',
  })
  @ApiOkResponse({
    type: String,
  })
  @ApiBearerAuth()
  @Post('/command')
  @UseGuards(AuthGuard)
  async chatBotCommand(@Body() body: AskBodyDto): Promise<string> {
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
      throw new ServiceUnavailableException('le bot à un problème');
    }
  }
}
