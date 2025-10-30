import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Channel, ChannelDocument } from '../schema/channel.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateChannelDto } from '../DTO/create-channel.dto';
import { Model } from 'mongoose';
import type { Notification } from '../schema/notification.schema';
@Injectable()
export class ChannelService {
  constructor(
    @InjectModel(Channel.name) private channelModel: Model<ChannelDocument>
  ) {}

  async create(dto: CreateChannelDto): Promise<Channel> {
    const newChannel = new this.channelModel(dto);
    const saved = await newChannel.save();
    return saved;
  }

  async getChannelsByServer(serverId: string): Promise<Channel[]> {
    return this.channelModel.find({ serverId }).exec();
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
}
