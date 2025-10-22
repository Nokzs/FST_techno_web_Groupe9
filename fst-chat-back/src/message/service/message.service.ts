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
    console.log('Creating message:', newMessage);
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

  async findByChannel(channelId: string): Promise<MessageDto[]> {
    // Récupère les messages et enrichit le pseudo via populate (projection 'pseudo' uniquement)
    const docs = await this.messageModel
      .find({ channelId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'pseudo')
      .lean()
      .exec();

    const serialized = docs.map((d: any) => {
      const populated = d.senderId && typeof d.senderId === 'object';
      const senderId = populated ? String(d.senderId._id) : String(d.senderId);
      const senderPseudo = populated ? d.senderId.pseudo : 'Unknown';
      return {
        _id: String(d._id),
        content: d.content,
        channelId: String(d.channelId),
        senderId,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        senderPseudo,
      };
    });

    return plainToInstance(MessageDto, serialized);
  }

  // Crée un message puis recharge et retourne un MessageDto enrichi (senderPseudo via populate)
  async createAndGetDto(createMessageDto: CreateMessageDto): Promise<MessageDto> {
    const created = await this.messageModel.create({
      senderId: createMessageDto.senderId,
      receiverId: createMessageDto.receiverId,
      channelId: createMessageDto.channelId,
      content: createMessageDto.content,
    });

    const d: any = await this.messageModel
      .findById(created._id)
      .populate('senderId', 'pseudo')
      .lean()
      .exec();

    const populated = d.senderId && typeof d.senderId === 'object';
    const senderId = populated ? String(d.senderId._id) : String(d.senderId);
    const senderPseudo = populated ? d.senderId.pseudo : 'Unknown';
    const serialized = {
      _id: String(d._id),
      content: d.content,
      channelId: String(d.channelId),
      senderId,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      senderPseudo,
    };

    return plainToInstance(MessageDto, serialized);
  }
}
