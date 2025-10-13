import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { UpdateMessageDto } from '../DTO/update-message.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from '../schema/message.schema';
import { MessageFile } from '../schema/messageFile.schema';
import { MessageFileDto } from '../DTO/MessageFileDto';
@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly messageFileModel: Model<MessageFile>
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const newMessage = new this.messageModel(createMessageDto);
    return newMessage.save();
  }

  async createMessageFile(
    createMessageFileDto: MessageFileDto
  ): Promise<MessageFile> {
    const newMessage = new this.messageFileModel(createMessageFileDto);
    return newMessage.save();
  }
  async findAll(): Promise<Message[]> {
    return this.messageModel.find().exec();
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

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto
  ): Promise<Message> {
    const message = await this.messageModel
      .findByIdAndUpdate(
        id,
        updateMessageDto,
        { new: true } // renvoie le document après modification
      )
      .exec();

    if (!message) {
      throw new Error('Message with id ' + id + ' not found');
    }

    return message;
  }

  async remove(id: string): Promise<Message> {
    const message = await this.messageModel.findByIdAndDelete(id).exec();

    if (!message) {
      throw new Error('Message with id ' + id + ' not found');
    }

    return message;
  }
}
