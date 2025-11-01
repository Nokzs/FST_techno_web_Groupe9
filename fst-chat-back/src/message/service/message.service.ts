import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from 'src/common/mongoose/inject-model.decorator';
import { Message, MessageDocument } from '../schema/message.schema';
import { CreateMessageDto } from '../DTO/create-message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = new this.messageModel({
      ...createMessageDto,
      translations: createMessageDto.translations ?? {},
    });
    const saved = await newMessage.save();
    const plain = saved.toObject() as Message & {
      translations?: Record<string, string> | Map<string, string>;
    };

    if (plain.translations instanceof Map) {
      plain.translations = Object.fromEntries(plain.translations.entries());
    }

    return plain as Message;
  }
  async findAll(): Promise<Message[]> {
    return this.messageModel.find().lean().exec() as Promise<Message[]>;
  }

  async findByUser(userId: string): Promise<Message[]> {
    return this.messageModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<Message[]>;
  }

  async findByChannel(channelId: string): Promise<Message[]> {
    return this.messageModel
      .find({ channelId })
      .sort({ createdAt: 1 })
      .lean()
      .exec() as Promise<Message[]>;
  }

  async appendTranslations(
    messageId: string,
    translations: Record<string, string>,
    detectedLanguage?: string
  ): Promise<void> {
    if (!messageId) {
      return;
    }

    const setPayload: Record<string, unknown> = {};

    if (detectedLanguage && detectedLanguage !== 'auto') {
      setPayload.detectedLanguage = detectedLanguage;
    }

    for (const [language, value] of Object.entries(translations ?? {})) {
      if (typeof value === 'string') {
        setPayload[`translations.${language}`] = value;
      }
    }

    if (Object.keys(setPayload).length === 0) {
      return;
    }

    await this.messageModel
      .updateOne({ _id: messageId }, { $set: setPayload })
      .exec();
  }
}
