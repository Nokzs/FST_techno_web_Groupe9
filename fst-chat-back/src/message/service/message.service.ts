import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from "@nestjs/common";
import { CreateMessageDto } from "../DTO/create-message.dto";
import { MessageFile } from "../schema/messageFile.schema";
import { MessageFileDto } from "../DTO/MessageFileDto";
import { Model, Types } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { Message, MessageDocument } from "../schema/message.schema";
import { Reaction } from "../schema/reaction.schema";
import { MessageTranslationService } from "./message-translation.service";
import { User, UserDocument } from "../../user/schema/user.schema";
import { Channel, ChannelDocument } from "../../channel/schema/channel.schema";
import { Server, ServerDocument } from "../../server/schema/server.schema";

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(MessageFile.name)
    private readonly messageFileModel: Model<MessageFile>,
    @InjectModel(Reaction.name)
    private readonly reactionModel: Model<Reaction>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Channel.name)
    private readonly channelModel: Model<ChannelDocument>,
    @InjectModel(Server.name)
    private readonly serverModel: Model<ServerDocument>,
    private readonly translationService: MessageTranslationService,
  ) {}

  async create(createMessageDto: CreateMessageDto): Promise<Message | null> {
    this.logger.log("le dto", createMessageDto);
    const files: MessageFile[] = await Promise.all(
      (createMessageDto.files || []).map((file: MessageFileDto) =>
        this.createMessageFile(file),
      ),
    );

    const translationTargets = await this.resolveTargetLanguages(
      createMessageDto,
    );

    if (translationTargets.length === 0) {
      this.logger.log('No translation targets found for message');
    } else {
      this.logger.log(
        `Translation targets for message: ${translationTargets.join(', ')}`,
      );
    }

    let detectedLanguage: string | null = null;
    let translations: Record<string, string> = {};

    if (createMessageDto.content && translationTargets.length > 0) {
      try {
        const translationResult =
          await this.translationService.translateContent(
            createMessageDto.content,
            translationTargets,
          );
        detectedLanguage = translationResult.detectedLanguage;
        translations = translationResult.translations;
        this.logger.log(
          `Translation computed. detected=${translationResult.detectedLanguage ?? "auto"} targets=${Object.keys(translationResult.translations).join(', ')}`
        );
      } catch (error) {
        const reason =
          error instanceof Error ? error.message : String(error);
        this.logger.warn("Message translation failed: " + reason);
      }
    }

    const payload: Record<string, unknown> = {
      ...createMessageDto,
      files,
    };

    if (detectedLanguage) {
      payload.detectedLanguage = detectedLanguage;
    }

    if (Object.keys(translations).length > 0) {
      payload.translations = translations;
    }

    const newMessage = new this.messageModel(payload);
    await newMessage.save();

    const result = await this.messageModel
      .findById(newMessage._id)
      .populate("senderId", "pseudo _id urlPicture")
      .populate("receiverId", "_id pseudo urlPicture")
      .populate({
        path: "reactions",
        populate: { path: "userId", select: "pseudo urlPicture" },
      })
      .lean()
      .exec();

    if (!result) {
      throw new InternalServerErrorException("Impossible de creer le message");
    }

    this.logger.log("je vais partir de la fonction en renvoyant", result);
    return result as Message;
  }

  async createMessageFile(
    createMessageFileDto: MessageFileDto,
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
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByChannel(
    channelId: string,
    requestingUserId?: string,
  ): Promise<Message[]> {
    this.logger.log(channelId);
    const messages = await this.messageModel
      .find({ channelId })
      .populate("senderId", "pseudo _id urlPicture")
      .populate("receiverId", "_id pseudo urlPicture")
      .populate({
        path: "reactions",
        populate: { path: "userId", select: "pseudo urlPicture" },
      })
      .lean()
      .sort({ createdAt: -1 })
      .exec();

    if (!requestingUserId) {
      return messages as Message[];
    }

    const requestingUser = await this.userModel
      .findById(requestingUserId)
      .select("language")
      .lean();

    const preferredLanguage = this.translationService.normalizeLanguage(
      requestingUser?.language,
    );

    if (!preferredLanguage) {
      return messages as Message[];
    }

    const enriched = await Promise.all(
      (messages as Message[]).map((message) =>
        this.ensureTranslationForMessage(message, preferredLanguage),
      ),
    );

    return enriched;
  }

  async addReaction(
    messageId: string,
    userId: string,
    emoji: string,
  ): Promise<Message | null> {
    this.logger.log(messageId);
    const message = await this.messageModel.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    let reaction = await this.reactionModel.findOne({ emoji, userId });
    if (!reaction) {
      reaction = new this.reactionModel({ emoji, userId });
      await reaction.save();
    }

    const alreadyLinked = message.reactions.some(
      (r) => r.toString() === reaction._id.toString(),
    );

    if (alreadyLinked) {
      await this.messageModel.updateOne(
        { _id: messageId },
        { $pull: { reactions: reaction._id } },
      );
    } else {
      await this.messageModel.updateOne(
        { _id: messageId },
        { $push: { reactions: reaction._id } },
      );
    }

    const result = await this.messageModel
      .findById(messageId)
      .populate("senderId", "pseudo _id urlPicture")
      .populate("receiverId", "_id pseudo urlPicture")
      .populate({
        path: "reactions",
        populate: { path: "userId", select: "pseudo urlPicture" },
      })
      .lean()
      .exec();

    return result as Message | null;
  }

  private async resolveTargetLanguages(
    createMessageDto: CreateMessageDto,
  ): Promise<string[]> {
    const participantIds = new Set<string>();

    if (createMessageDto.senderId) {
      participantIds.add(createMessageDto.senderId);
    }

    if (createMessageDto.receiverId) {
      participantIds.add(createMessageDto.receiverId);
    }

    const serverMemberIds = await this.collectServerMemberIds(
      createMessageDto.channelId,
    );
    serverMemberIds.forEach((id) => participantIds.add(id));

    if (participantIds.size === 0) {
      return [];
    }

    const users = await this.userModel
      .find({ _id: { $in: Array.from(participantIds) } })
      .select("language")
      .lean();

    const codes = users
      .map((user) => this.translationService.normalizeLanguage(user.language))
      .filter((code): code is string => Boolean(code));

    return Array.from(new Set(codes));
  }

  private async collectServerMemberIds(
    channelId?: string,
  ): Promise<string[]> {
    if (!channelId) {
      return [];
    }

    const channel = await this.channelModel
      .findById(channelId)
      .select("serverId")
      .lean();

    if (!channel?.serverId) {
      return [];
    }

    const server = await this.serverModel
      .findById(channel.serverId)
      .select("members")
      .lean();

    if (!server?.members?.length) {
      return [];
    }

    return server.members
      .map((member) =>
        typeof member === "string" ? member : (member as Types.ObjectId)?.toString(),
      )
      .filter((id): id is string => Boolean(id));
  }

  private async ensureTranslationForMessage(
    message: Message,
    targetLanguage: string,
  ): Promise<Message> {
    if (!message.content) {
      return message;
    }

    const translations = message.translations ?? {};
    const detected = message.detectedLanguage ?? null;

    if (targetLanguage === detected || translations[targetLanguage]) {
      return message;
    }

    try {
      const translationResult = await this.translationService.translateContent(
        message.content,
        [targetLanguage],
        { sourceLanguage: detected },
      );

      const translatedText = translationResult.translations[targetLanguage];
      if (!translatedText) {
        return message;
      }

      const updates: Record<string, unknown> = {
        [`translations.${targetLanguage}`]: translatedText,
      };

      if (!message.detectedLanguage && translationResult.detectedLanguage) {
        updates.detectedLanguage = translationResult.detectedLanguage;
      }

      await this.messageModel.updateOne(
        { _id: message["_id"] },
        { $set: updates },
      );

      return {
        ...message,
        detectedLanguage:
          message.detectedLanguage ??
          translationResult.detectedLanguage ??
          null,
        translations: {
          ...translations,
          [targetLanguage]: translatedText,
        },
      } as Message;
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        "Unable to translate message " + (message["_id"] ?? "") + ": " + reason,
      );
      return message;
    }
  }
}
