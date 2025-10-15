import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { MessageDto } from '../DTO/message.dto';
import { CreateMessageDto } from '../DTO/create-message.dto';
import type { IStorageProvider } from 'src/storage/provider/IStorageProvider';
import { PublicUrlDTO } from 'src/storage/DTO/publicUrl';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/guards/authGuard';
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request
  ) {
    Logger.log('je veux creer un message');
    const id = req['user'].sub;
    return this.messageService.create(createMessageDto);
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get('filePublicUrl')
  getPublicUrl(
    @Query('fileName') fileName: string,
    @Query('channelId') channelId: string
  ): PublicUrlDTO {
    console.log(channelId);
    const url = this.storage.getPublicUrl(fileName, 'messageFile', channelId);
    return plainToInstance(PublicUrlDTO, { publicUrl: url });
  }
}
