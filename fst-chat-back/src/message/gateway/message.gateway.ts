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

  @SubscribeMessage('joinChannelRoom')
  handleJoinRoom(
    @MessageBody() channelId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.join(channelId);
    console.log(`Client ${client.id} joined channel room ${channelId}`);
  }

  // Quitter une room
  @SubscribeMessage('leaveChannelRoom')
  handleLeaveRoom(
    @MessageBody() channelId: string,
    @ConnectedSocket() client: Socket
  ) {
    client.leave(channelId);
    console.log(`Client ${client.id} left channel room ${channelId}`);
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
    this.server.to(dto.channelId).emit('newMessage', message);
    console.log('Message broadcasted to channel:', dto.channelId);
    console.log('Message content:', message);
    return message;
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@MessageBody() channelId: string) {
    const messages = await this.messageService.findByChannel(channelId);
    return messages;
  }
}
