import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { plainToInstance } from 'class-transformer';
import { MessageDto } from '../DTO/message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  findAll() {
    const messages = this.messageService.findAll();
    return messages.then((tab) =>
      tab.map((message) => plainToInstance(MessageDto, message))
    );
  }
}
