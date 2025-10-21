import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { MessageService } from '../service/message.service';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { TokenService } from '../../token/token.service';
import * as cookie from 'cookie';
import { MessageDto } from '../DTO/message.dto';

type reactionType = {
  emoji: string;
  messageId: string;
  channelId: string;
};

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
    Logger.log(`New client connected: ${client.id}`);
    const rawCookie = client.handshake?.headers?.cookie;
    if (!rawCookie) {
      client.disconnect();
      Logger.log('Client disconnected: No cookies found');
      return;
    }
    const parseCookie = cookie.parse(rawCookie);
    const token = parseCookie['fst_chat_token'];
    if (!token) {
      Logger.log('Client disconnected: No auth token found in cookies');
      client.disconnect();
      return;
    }
    try {
      const payload = await this.tokenService.verifyToken(token);
      if (!payload || !payload.sub) {
        Logger.log('Client disconnected: Invalid auth token');
        client.disconnect();
        return;
      }
      client.data.id = payload.sub;
      Logger.log(`Client connected: ${client.id} (User ID: ${client.data.id})`);
    } catch (e) {
      Logger.log('Client disconnected: Error verifying token');
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
    Logger.log(`Client ${client.id} joined channel room ${channelId}`);
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
    Logger.log(`Client ${socket.id} is sending a message`);
    // Transforme et valide le DTO (pas automatique comme le controlleur)
    const dto: CreateMessageDto = plainToInstance(CreateMessageDto, data);
    dto.senderId = socket.data.id;
    Logger.log(dto);
    const errors = await validate(dto);
    if (errors.length > 0) {
      Logger.log(errors);
      return { error: 'Validation failed', details: errors };
    }
    Logger.log('je vais créer le message');
    const message = await this.messageService.create(dto);
    Logger.log('new message', message);
    // Broadcast
    if (!dto.channelId) {
      Logger.log('No channelId provided in message DTO');
      return;
    }

    this.server.to(dto.channelId).emit('newMessage', message);
    console.log('Message broadcasted to channel:', dto.channelId);
    console.log('Message content:', message);
    return message;
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(@MessageBody() channelId: string) {
    const messages = await this.messageService.findByChannel(channelId);
    Logger.log('message', messages);

    return messages.map((msg) => {
      return plainToInstance(MessageDto, msg);
    });
  }

  @SubscribeMessage('newReactions')
  async handleNewMessageReaction(
    @MessageBody() reaction: reactionType,
    @ConnectedSocket() socket: Socket
  ): Promise<void> {
    const user: string = socket.data.id;
    
    Logger.log(user);
    const message = await this.messageService.addReaction(
      reaction.messageId,
      user,
      reaction.emoji
    );
    Logger.log("newMessage",message);
    this.server.to(reaction.channelId).emit('newReactions', message);
  }
}
