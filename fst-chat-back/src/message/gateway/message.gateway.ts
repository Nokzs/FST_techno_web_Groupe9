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
import {
  MessageTranslationService,
  EnsureTranslationResult,
} from '../service/message-translation.service';
import { UserService } from '../../user/service/user.service';
import { Message } from '../schema/message.schema';

type JoinChannelPayload = {
  channelId: string;
  userId?: string;
};

type SocketMetadata = {
  userId?: string;
  language: string;
};

type TranslatedMessagePayload = Message & {
  originalContent: string;
  translatedContent: string;
  targetLanguage: string;
};

@WebSocketGateway({ cors: true })
export class MessageGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly channelMembers = new Map<string, Set<string>>();
  private readonly socketMetadata = new Map<string, SocketMetadata>();

  constructor(
    private readonly messageService: MessageService,
    private readonly translationService: MessageTranslationService,
    private readonly userService: UserService
  ) {}
  handleConnection(client: Socket): void {
    void client;
  }

  handleDisconnect(client: Socket) {
    this.unregisterSocket(client.id);
  }

  private unregisterSocket(socketId: string): void {
    this.socketMetadata.delete(socketId);
    for (const [channelId, sockets] of this.channelMembers) {
      if (sockets.delete(socketId) && sockets.size === 0) {
        this.channelMembers.delete(channelId);
      }
    }
  }

  private ensureChannelSet(channelId: string): Set<string> {
    const existing = this.channelMembers.get(channelId);
    if (existing) {
      return existing;
    }
    const created = new Set<string>();
    this.channelMembers.set(channelId, created);
    return created;
  }

  private async resolveSocketMetadata(
    socketId: string,
    userId?: string
  ): Promise<SocketMetadata> {
    const existing = this.socketMetadata.get(socketId);
    if (existing && (existing.userId === userId || !userId)) {
      return existing;
    }

    let language = this.translationService.resolveLanguageCode(undefined);
    if (userId) {
      const user = await this.userService.findById(userId);
      language = this.translationService.resolveLanguageCode(user?.language);
    }

    const metadata: SocketMetadata = { userId, language };
    this.socketMetadata.set(socketId, metadata);
    return metadata;
  }
  @SubscribeMessage('joinChannelRoom')
  async handleJoinRoom(
    @MessageBody() payload: JoinChannelPayload,
    @ConnectedSocket() client: Socket
  ) {
    const { channelId, userId } = payload ?? {};
    if (!channelId) {
      return { error: 'channelId is required' };
    }

    await client.join(channelId);
    const sockets = this.ensureChannelSet(channelId);
    sockets.add(client.id);

    await this.resolveSocketMetadata(client.id, userId);

    return { status: 'joined', channelId };
  }

  @SubscribeMessage('leaveChannelRoom')
  async handleLeaveRoom(
    @MessageBody() channelId: string,
    @ConnectedSocket() client: Socket
  ) {
    if (!channelId) {
      return;
    }
    await client.leave(channelId);
    const sockets = this.channelMembers.get(channelId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.channelMembers.delete(channelId);
      }
    }
  }
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: unknown,
    @ConnectedSocket() client: Socket
  ) {
    const dto = plainToInstance(CreateMessageDto, data);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return { error: 'Validation failed', details: errors };
    }

    await this.resolveSocketMetadata(client.id, dto.senderId);

    const sockets = this.ensureChannelSet(dto.channelId);
    sockets.add(client.id);

    const targetLanguages = new Set<string>();
    for (const socketId of sockets) {
      const metadata = this.socketMetadata.get(socketId);
      const language = this.translationService.resolveLanguageCode(
        metadata?.language
      );
      targetLanguages.add(language);
    }

    const { detectedLanguage, translations } =
      await this.translationService.buildTranslations(
        dto.content,
        targetLanguages,
        dto.detectedLanguage
      );

    dto.detectedLanguage = detectedLanguage;
    dto.translations = translations;

    const message = await this.messageService.create(dto);
    const messageId = this.extractMessageId(message);
    const payloadBase = {
      ...message,
      originalContent: message.content,
      detectedLanguage,
    };

    const translationCache = new Map<string, string>(
      Object.entries(translations ?? {})
    );
    const socketsArray = Array.from(sockets);

    for (const socketId of socketsArray) {
      const socket = this.server.sockets.sockets.get(socketId);
      if (!socket) {
        continue;
      }

      const metadata = this.socketMetadata.get(socketId);
      const targetLanguage = this.translationService.resolveLanguageCode(
        metadata?.language
      );

      const translation = await this.ensureTranslationForLanguage(
        messageId,
        message.content,
        targetLanguage,
        detectedLanguage,
        translationCache
      );

      socket.emit('newMessage', {
        ...payloadBase,
        translatedContent: translation.translatedText,
        targetLanguage: translation.targetLanguage,
      } as TranslatedMessagePayload);
    }

    return payloadBase;
  }

  private async ensureTranslationForLanguage(
    messageId: string,
    content: string,
    targetLanguage: string,
    detectedLanguage: string,
    cache: Map<string, string>
  ): Promise<EnsureTranslationResult> {
    const existing = cache.get(targetLanguage);
    if (existing) {
      return {
        translatedText: existing,
        detectedLanguage,
        shouldPersistDetection: false,
        shouldPersistTranslation: false,
        targetLanguage,
      };
    }

    const translation = await this.translationService.ensureTranslation(
      content,
      targetLanguage,
      undefined,
      detectedLanguage
    );

    if (translation.shouldPersistTranslation) {
      cache.set(translation.targetLanguage, translation.translatedText);
      await this.messageService.appendTranslations(
        messageId,
        { [translation.targetLanguage]: translation.translatedText },
        translation.shouldPersistDetection
          ? translation.detectedLanguage
          : undefined
      );
    } else if (!cache.has(translation.targetLanguage)) {
      cache.set(translation.targetLanguage, translation.translatedText);
    }

    return translation;
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @MessageBody() channelId: string,
    @ConnectedSocket() client: Socket
  ) {
    if (!channelId) {
      return [];
    }

    const messages = await this.messageService.findByChannel(channelId);
    const metadata = this.socketMetadata.get(client.id);
    const targetLanguage = this.translationService.resolveLanguageCode(
      metadata?.language
    );

    const response: TranslatedMessagePayload[] = [];
    for (const message of messages) {
      const translations = this.extractTranslations(message);
      const translation = await this.translationService.ensureTranslation(
        message.content,
        targetLanguage,
        translations[targetLanguage],
        message.detectedLanguage
      );

      if (translation.shouldPersistTranslation) {
        await this.messageService.appendTranslations(
          this.extractMessageId(message),
          { [translation.targetLanguage]: translation.translatedText },
          translation.shouldPersistDetection
            ? translation.detectedLanguage
            : undefined
        );
      }

      response.push({
        ...message,
        originalContent: message.content,
        translatedContent: translation.translatedText,
        targetLanguage: translation.targetLanguage,
      } as TranslatedMessagePayload);
    }

    return response;
  }

  private extractTranslations(message: Message): Record<string, string> {
    const { translations } = message;
    if (!translations) {
      return {};
    }

    if (translations instanceof Map) {
      return Object.fromEntries(translations.entries()) as Record<
        string,
        string
      >;
    }

    return translations;
  }

  private extractMessageId(message: Message): string {
    const rawId = (message as unknown as { _id?: unknown })._id;
    if (!rawId) {
      return '';
    }

    if (typeof rawId === 'string') {
      return rawId;
    }

    const candidate = rawId as { toString?: () => string };
    return typeof candidate.toString === 'function' ? candidate.toString() : '';
  }
}
