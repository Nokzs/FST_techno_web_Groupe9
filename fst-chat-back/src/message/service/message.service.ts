import { Injectable, Logger } from '@nestjs/common';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { MessageFile } from '../schema/messageFile.schema';
import { MessageFileDto } from '../DTO/MessageFileDto';
import { MessageDto } from '../DTO/message.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from '../schema/message.schema';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(MessageFile.name)
    private readonly messageFileModel: Model<MessageFile>
  ) {}

  async create(
    id: string, // sender's ID
    createMessageDto: CreateMessageDto
  ): Promise<Message> {
    const files: MessageFile[] = await Promise.all(
      (createMessageDto.files || []).map(async (f: MessageFileDto) => {
        return this.createMessageFile(f); // async handler
      })
    );

    const newMessage = new this.messageModel({
      senderId: id,
      receiverId: createMessageDto.receiverId || undefined,
      channelId: createMessageDto.channelId || undefined,
      content: createMessageDto.content,
      files: files,
      read: false,
    });

    Logger.log(`Creating message from ${id} ${newMessage}`);
    return newMessage.save();
  }

  async createMessageFile(
    createMessageFileDto: MessageFileDto
  ): Promise<MessageFile> {
    const newMessage = new this.messageFileModel(createMessageFileDto);
    return newMessage.save();
  }
  async findAll(): Promise<Message[]> {
    return this.messageModel.find().lean().exec();
  }

  async findByUser(userId: string): Promise<Message[]> {
    return this.messageModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .sort({ createdAt: -1 }) // du plus recent au plus ancien
      .exec();
  }

  async findByChannel(channelId: string): Promise<Message[]> {
    return this.messageModel.find({ channelId }).sort({ createdAt: 1 }).exec();
  }
}
