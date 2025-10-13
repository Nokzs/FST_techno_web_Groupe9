import { Controller, Get, Post, Body, Query, Inject } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { UpdateMessageDto } from '../DTO/update-message.dto';
import type { IStorageProvider } from 'src/storage/provider/IStorageProvider';
import { PublicUrlDTO } from 'src/storage/DTO/publicUrl';
import { plainToInstance } from 'class-transformer';
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
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
