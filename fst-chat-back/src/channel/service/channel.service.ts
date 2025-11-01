import { Injectable } from '@nestjs/common';
import { Channel, ChannelDocument } from '../schema/channel.schema';
import { InjectModel } from 'src/common/mongoose/inject-model.decorator';
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
    return saved.toObject();
  }

  async getChannelsByServer(serverId: string): Promise<Channel[]> {
    return this.channelModel.find({ serverId }).lean().exec() as Promise<
      Channel[]
    >;
  }
}
