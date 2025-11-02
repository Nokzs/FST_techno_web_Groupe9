import { Injectable } from '@nestjs/common';
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

  async getById(channelId: string): Promise<Channel | null> {
    return this.channelModel.findById(channelId).lean().exec();
  }

  async deleteById(channelId: string): Promise<Channel | null> {
    const deleted = await this.channelModel.findByIdAndDelete(channelId).lean().exec();
    return deleted as unknown as Channel | null;
  }
}
