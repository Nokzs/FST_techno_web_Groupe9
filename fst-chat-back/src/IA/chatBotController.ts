import {
  Body,
  Controller,
  Inject,
  Post,
  UseGuards,
  Logger,
} from '@nestjs/common';
import type { IIaProvider } from './IaProvider/IiaProvider';
import { AuthGuard } from 'src/guards/authGuard';
type AskBody = {
  question: string;
  channelId: string;
  userId: string;
};
@Controller('/chatBot')
export class chatBotController {
  constructor(@Inject('IA_PROVIDER') private readonly iaService: IIaProvider) {}

  @Post('/ask')
  @UseGuards(AuthGuard)
  async ask(@Body() body: AskBody): Promise<string> {
    Logger.log('Received question: ', body);
    const { question, channelId, userId }: AskBody = body;
    const answer = await this.iaService.ask(question, channelId, userId);
    return answer;
  }
}
