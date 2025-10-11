import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../service/message.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMessageDto } from '../DTO/create-message.dto';

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly messageService: MessageService) {}

  handleConnection(client: Socket) {
    // Optionnel : log, authentification, etc.
  }

  handleDisconnect(client: Socket) {
    // Optionnel : log, cleanup, etc.
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() data: any) {
    // Transforme et valide le DTO (pas automatique comme le controlleur)
    const dto: CreateMessageDto = plainToInstance(CreateMessageDto, data);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return { error: 'Validation failed', details: errors };
    }

    const message = await this.messageService.create(dto);
    // Broadcast
    this.server.emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages() {
    const messages = await this.messageService.findAll();
    return messages;
  }
}
