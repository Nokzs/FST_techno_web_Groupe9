import {
  Injectable,
  Logger,
  InternalServerErrorException,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateMessageDto } from '../DTO/create-message.dto';
import { MessageFile } from '../schema/messageFile.schema';
import { MessageFileDto } from '../DTO/MessageFileDto';
import { MessageDto } from '../DTO/message.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Message, MessageDocument } from '../schema/message.schema';
import { Reaction } from '../schema/reaction.schema';
import type { IIaProvider } from '../../IA/IaProvider/IiaProvider';
@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(MessageFile.name)
    private readonly messageFileModel: Model<MessageFile>,
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<Reaction>,
    @Inject('IA_PROVIDER') private readonly iaProvider: IIaProvider
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message | null> {
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
      .populate('senderId', 'pseudo _id urlPicture')
      .populate('receiverId', '_id pseudo urlPicture')
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

  async findByChannel(
    channelId: string,
    date: string
  ): Promise<{ messages: Message[]; hasMore: boolean }> {
    Logger.log(channelId);
    Logger.log('date', date);
    const findObj = date
      ? { channelId, createdAt: { $lt: date } }
      : { channelId };

    const messages = await this.messageModel
      .find(findObj)
      .limit(51)
      .populate('senderId', 'pseudo _id urlPicture')
      .populate('receiverId', '_id pseudo urlPicture')
      .populate({
        path: 'reactions',
        populate: { path: 'userId', select: 'pseudo urlPicture' },
      })
      .lean()
      .sort({ createdAt: -1 })
      .exec();
    const hasMore = messages.length > 50;
    const slicedMessages = hasMore ? messages.slice(0, 50) : messages;
    return {
      messages: slicedMessages,
      hasMore: hasMore,
    };
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
      .populate('senderId', 'pseudo _id urlPicture')
      .populate('receiverId', '_id pseudo urlPicture')
      .populate({
        path: 'reactions',
        populate: { path: 'userId', select: 'pseudo urlPicture' },
      })
      .lean()
      .exec();
    return result;
  }
  public async embedMessage(messageId: string) {
    const message = await this.messageModel.findById(messageId).exec();
    if (!message) {
      throw new Error('Message not found');
    }
    const embedding = await this.iaProvider.embed(message.content);
    if (!embedding) {
      return 'Failed to generate embedding';
    }
    const embeddingNorm = Math.sqrt(
      embedding.reduce((sum, val) => sum + val * val, 0)
    );
    await this.messageModel
      .findByIdAndUpdate(
        messageId,
        { embedding, embeddingNorm },
        { new: true } // retourne le document mis à jour
      )
      .exec();
  }
  public async updateMessageFiles(messageDto: MessageDto) {
    if (!messageDto._id) {
      throw new BadRequestException(
        'Message ID is required to update the message'
      );
    }

    // Création des fichiers si présents
    const files: MessageFile[] = await Promise.all(
      (messageDto.files || []).map(async (f: MessageFileDto) =>
        this.createMessageFile(f)
      )
    );

    // Mise à jour du message via _id et passage de sending à false
    const updatedMessage = await this.messageModel
      .findByIdAndUpdate(
        messageDto._id,
        { $set: { ...messageDto, files, sending: false } },
        { new: true }
      )
      .populate('senderId', 'pseudo _id urlPicture')
      .populate('receiverId', '_id pseudo urlPicture')
      .populate({
        path: 'reactions',
        populate: { path: 'userId', select: 'pseudo urlPicture' },
      })
      .lean()
      .exec();

    if (!updatedMessage) {
      throw new NotFoundException(
        `Message with ID ${messageDto._id} not found`
      );
    }

    return updatedMessage;
  }
}
