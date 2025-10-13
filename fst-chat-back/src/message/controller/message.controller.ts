import { Controller, Get, Post, Body, Query, Inject } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { UpdateMessageDto } from '../DTO/update-message.dto';
import type { IStorageProvider } from 'src/storage/provider/IStorageProvider';
import { PublicUrlDTO } from 'src/storage/DTO/publicUrl';
import { plainToInstance } from 'class-transformer';
import { MessageFile } from '../schema/messageFile.schema';
import { MessageFileDto } from '../DTO/MessageFileDto';
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}

  @Post()
  async create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  
   /*  const files: MessageFile[] = await Promise.all(
    (createMessageDto.files || []).map(async (f: MessageFileDto) => {
        return this.messageService.createMessageFile(f); // async
      })
  ); */
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
