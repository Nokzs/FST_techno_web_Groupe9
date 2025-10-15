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
import { TokenService } from '../../token/token.service';
import * as cookie from 'cookie';
@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly tokenService: TokenService
  ) {}

  async handleConnection(client: Socket) {
    const rawCookie = client.handshake?.headers?.cookie;
    if (!rawCookie) {
      client.disconnect();
      return;
    }
    const parseCookie = cookie.parse(rawCookie);
    const token = parseCookie['fst-chat-token'];
    if (!token) {
      client.disconnect();
      return;
    }
    try {
      const payload = await this.tokenService.verifyToken(token);
      if (!payload || !payload.sub) {
        client.disconnect();
        return;
      }
      client.data.id = payload.sub;
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // On convertit Set en Array pour itérer
    const rooms = Array.from(client.rooms);

    rooms.forEach((room) => {
      if (room !== client.id) {
        // ignore la room privée de la socket
        client.leave(room);
      }
    });
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
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket
  ) {
    // Transforme et valide le DTO (pas automatique comme le controlleur)
    const dto: CreateMessageDto = plainToInstance(CreateMessageDto, data);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return { error: 'Validation failed', details: errors };
    }

    const message = await this.messageService.create(dto);
    // Broadcast
    if (dto.channelId) {
      this.server.to(dto.channelId).emit('newMessage', message);
      console.log('Message broadcasted to channel:', dto.channelId);
      console.log('Message content:', message);
    }
    return message;
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@MessageBody() channelId: string) {
    const messages = await this.messageService.findByChannel(channelId);
    return messages;
  }
}
