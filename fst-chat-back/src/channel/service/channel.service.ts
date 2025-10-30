import { Injectable, Logger } from '@nestjs/common';
import { Channel, ChannelDocument } from '../schema/channel.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CreateChannelDto } from '../DTO/create-channel.dto';
import { Model } from 'mongoose';

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
}
