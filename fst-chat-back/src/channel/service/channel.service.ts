import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Channel, ChannelDocument } from '../schema/channel.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateChannelDto } from '../DTO/create-channel.dto';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
} from '../schema/notification.schema';
import {
  RoleAssignment,
  RoleAssignmentDocument,
} from 'src/roles/schema/role-assignment.schema';
@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(RoleAssignment.name)
    private readonly roleAssignmentModel: Model<RoleAssignmentDocument>
  ) {}

  async create(dto: CreateChannelDto): Promise<Channel> {
    const newChannel = new this.channelModel(dto);
    const saved = await newChannel.save();
    return saved;
  }

  async getChannelsByServer(serverId: string): Promise<Channel[]> {
    return this.channelModel.find({ serverId }).exec();
  }

  async getById(channelId: string): Promise<Channel | null> {
    return this.channelModel.findById(channelId).lean().exec();
  }

  async deleteById(channelId: string): Promise<Channel | null> {
    const deleted = await this.channelModel
      .findByIdAndDelete(channelId)
      .lean()
      .exec();
    return deleted as unknown as Channel | null;
  }
  async getPopulateChannel(channelId: string): Promise<Channel | null> {
    const populateChannel = await this.channelModel
      .findById(channelId)
      .populate('serverId', 'name _id ownerId')
      .lean()
      .exec();
    return populateChannel;
  }
  async addNotification(
    channelId: string,
    messageId: string,
    userId: string
  ): Promise<Notification> {
    const channel = await this.channelModel.findById(channelId);
    if (!channel) throw new Error('Channel introuvable');

    const notification: Notification = {
      channelId,
      messageId,
      seenBy: [userId],
      serverId: channel.serverId.toString(),
    };
    channel.notification.push(notification);
    await channel.save();

    return notification;
  } // Marquer une notification comme lue pour un utilisateur

  async read(userId: string, channelId: string): Promise<void> {
    await this.channelModel.updateOne(
      { _id: channelId },
      { $addToSet: { 'notification.$[].seenBy': userId } }
    );
  }
  async getChannelsWithNotifications(
    userId: string,
    serverId: string
  ): Promise<Channel[]> {
    const serverObjectId = new Types.ObjectId(serverId);
    const userObjectId = new Types.ObjectId(userId);

    // 1️⃣ Récupérer la date d'arrivée de l'utilisateur dans le serveur
    const roleAssignment = await this.roleAssignmentModel
      .findOne({
        serverId: serverObjectId,
        userId: userObjectId,
      })
      .lean();

    const joinDate = roleAssignment?.createdAt || new Date(0); // si pas de RoleAssignment, tout récupérer
    // 2️⃣ Récupérer tous les channels

    const channels = await this.channelModel.find({ serverId }).lean().exec();

    // 3️⃣ Pour chaque channel, récupérer les notifications pertinentes
    const results = await Promise.all(
      channels.map(async (channel) => {
        const notifications = await this.notificationModel
          .find({
            channelId: channel._id,
            createdAt: { $gte: joinDate },
          })
          .lean();

        const channels = {
          ...channel,
          notification: notifications, // garde le nom singulier pour ton frontend
        };
        return channels;
      })
    );
    return results;
  }
}
