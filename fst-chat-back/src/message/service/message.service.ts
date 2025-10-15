import { Injectable } from '@nestjs/common';
import { MessageDto } from '../DTO/message.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from '../schema/message.schema';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = new this.messageModel(createMessageDto);
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
