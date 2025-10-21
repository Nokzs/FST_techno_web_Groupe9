import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { MessageFile } from '../schema/messageFile.schema';
import { MessageFileDto } from '../DTO/MessageFileDto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from '../schema/message.schema';
import { Reaction } from '../schema/reaction.schema';
@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(MessageFile.name)
    private readonly messageFileModel: Model<MessageFile>,
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<Reaction>
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message | null> {
    Logger.log('le dto', createMessageDto);
    const files: MessageFile[] = await Promise.all(
      (createMessageDto.files || []).map(async (f: MessageFileDto) => {
        return this.createMessageFile(f); // async handler
      })
    );

    const newMessage = new this.messageModel({
      ...createMessageDto,
      files: files,
    });
    await newMessage.save();
    const result = await this.messageModel
      .findById(newMessage._id)
      .populate('senderId', 'pseudo _id profilPictureUrl')
      .populate('receiverId', '_id pseudo')
      .populate({
        path: 'reactions',
        populate: { path: 'userId', select: 'pseudo urlPicture' },
      })
      .lean()
      .exec();

    if (!result) {
      throw new InternalServerErrorException('Impossible de créer le message');
    }
    Logger.log('je vais partir de la fonction en renvoyant', result);
    return result;
  }

  async createMessageFile(
    createMessageFileDto: MessageFileDto
  ): Promise<MessageFile> {
    const newMessage = new this.messageFileModel(createMessageFileDto);
    return newMessage.save();
  }
  async findAll(): Promise<Message[]> {
    return this.messageModel.find().lean().sort({ createdAt: -1 }).exec();
  }

  async findByUser(userId: string): Promise<Message[]> {
    return this.messageModel
      .find({ $or: [{ senderId: userId }, { receiverId: userId }] })
      .sort({ createdAt: -1 }) // du plus recent au plus ancien
      .exec();
  }

  findByChannel(channelId: string): Promise<Message[]> {
    Logger.log(channelId);
    return this.messageModel
      .find({ channelId })
      .populate('senderId', 'pseudo _id profilPictureUrl')
      .populate('receiverId', '_id pseudo')
      .populate({
        path: 'reactions',
        populate: { path: 'userId', select: 'pseudo urlPicture' },
      })
      .lean()
      .sort({ createdAt: -1 })
      .exec();
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<Message | null> {
    Logger.log(messageId);
    const message = await this.messageModel.findById(messageId);
    if (!message) throw new Error('Message not found');
    // Cherche ou crée la réaction globale
    let reaction = await this.reactionModel.findOne({ emoji, userId });
    if (!reaction) {
      reaction = new this.reactionModel({ emoji, userId });
      await reaction.save();
    }
    const alreadyLinked = message.reactions.some(
      (r) => r.toString() === reaction._id.toString()
    );

    if (alreadyLinked) {
      // Supprime la référence
      await this.messageModel.updateOne(
        { _id: messageId },
        { $pull: { reactions: reaction._id } }
      );
    } else {
      // Ajoute la référence
      await this.messageModel.updateOne(
        { _id: messageId },
        { $push: { reactions: reaction._id } }
      );
    }
    const result = await this.messageModel
      .findById(messageId)
      .populate('senderId', 'pseudo _id profilPictureUrl')
      .populate('receiverId', '_id pseudo')
      .populate({
        path: 'reactions',
        populate: { path: 'userId', select: 'pseudo urlPicture' },
      })
      .lean()
      .exec();
    return result;
  }
}
