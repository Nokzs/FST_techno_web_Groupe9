import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
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
import { Message } from '../schema/message.schema';
import { EventEmitter } from 'stream';
import { ChannelService } from 'src/channel/service/channel.service';
type reactionType = {
  emoji: string;
  messageId: string;
  channelId: string;
};

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;
  eventEmitter: EventEmitter;
  constructor(
    private readonly messageService: MessageService,
    private readonly channelService: ChannelService,
    private readonly tokenService: TokenService
  ) {
    this.eventEmitter = new EventEmitter();
  }
  afterInit() {
    this.eventEmitter.on('embedding', (message: Message) => {
      Logger.log('je vais embbed');
      this.messageService.embedMessage(message._id.toString()).then((msg) => {
        Logger.log(msg);
      });
    });
  }

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

  @SubscribeMessage('joinServer')
  async handleJoinServerRoom(
    @MessageBody() serverId: string,
    @ConnectedSocket() socket: Socket
  ) {
    await socket.join(`serveur-${serverId}`);
  }

  @SubscribeMessage('leaveServer')
  async handleLeaveServerRoom(
    @MessageBody() serverId: string,
    @ConnectedSocket() socket: Socket
  ) {
    await socket.leave(`serveur-${serverId}`);
  }

  @SubscribeMessage('updateServer')
  handleUpdateServer(@MessageBody() serverId: string) {
    this.server.to(`serveur-${serverId}`).emit('updateServer', serverId);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket
  ) {
    // Transforme et valide le DTO (pas automatique comme le controlleur)
    Logger.log(`Client ${socket.id} is sending a message`);
    const dto: CreateMessageDto = plainToInstance(CreateMessageDto, data);
    dto.senderId = socket.data.id;
    const errors = await validate(dto);
    if (errors.length > 0) {
      Logger.log(errors);
      return { error: 'Validation failed', details: errors };
    }
    const message = await this.messageService.create(dto);

    // Broadcast
    if (!dto.channelId) {
      Logger.log('No channelId provided in message DTO');
      return;
    }
    if (message) {
      const notif = await this.channelService.addNotification(
        message.channelId.toString(),
        message._id.toString(),
        dto.senderId
      );
      this.server
        .to(`serveur-${notif.serverId}`)
        .emit('newNotification', notif);
      this.server.to(dto.channelId).emit('newMessage', message);
      //comme l'opération prends on le délégue comme un autre evenement de vite renvoyez le message
      Logger.log('emitting embedding event');
      this.eventEmitter.emit('embedding', message);
    }
    console.log('Message broadcasted to channel:', dto.channelId);
    console.log('Message content:', message);
    return message;
  }

  @SubscribeMessage('read')
  async readNotif(
    @MessageBody() messagesData: { channelId: string; userId: string }
  ) {
    Logger.log(
      `le user ${messagesData.userId} veut valider les notif pour ${messagesData.channelId}`
    );
    await this.channelService.read(messagesData.userId, messagesData.channelId);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() messagesData: { channelId: string; date: string }
  ) {
    const { messages, hasMore } = await this.messageService.findByChannel(
      messagesData.channelId,
      messagesData.date
    );

    return {
      messages: messages.map((msg) => {
        return plainToInstance(MessageDto, msg);
      }),
      hasMore,
    };
  }

  @SubscribeMessage('newReactions')
  async handleNewMessageReaction(
    @MessageBody() reaction: reactionType,
    @ConnectedSocket() socket: Socket
  ): Promise<void> {
    const user: string = socket.data.id;
    const message = await this.messageService.addReaction(
      reaction.messageId,
      user,
      reaction.emoji
    );
    this.server.to(reaction.channelId).emit('newReactions', message);
  }
  @SubscribeMessage('updateMessageFiles')
  async handleUpdateMessageFiles(@MessageBody() data: MessageDto) {
    const updatedMessage = await this.messageService.updateMessageFiles(data);
    this.server
      .to(updatedMessage.channelId.toString())
      .emit('updateMessageFiles', updatedMessage);
  }
  @SubscribeMessage('deleteMessage')
  async handleDeleteMessage(
    @MessageBody() data: { messageId: string; channelId: string }
  ) {
    await this.messageService.deleteMessage(data.messageId);
    this.server.to(data.channelId).emit('deleteMessage', data.messageId);
  }
}
