import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from 'src/common/mongoose/inject-model.decorator';
import { Server, ServerDocument } from '../schema/server.schema';
import { CreateServerDto } from '../DTO/create-server.dto';

@Injectable()
export class ServerService {
  constructor(
    @InjectModel(Server.name) private serverModel: Model<ServerDocument>
  ) {}

  async create(dto: CreateServerDto): Promise<Server> {
    const newServer = new this.serverModel(dto);
    const saved = await newServer.save();
    return saved.toObject();
  }

  async findAll(): Promise<Server[]> {
    return this.serverModel.find().lean().exec() as Promise<Server[]>;
  }

  async findByUserId(userId: string): Promise<Server[]> {
    return this.serverModel.find({ members: userId }).lean().exec() as Promise<
      Server[]
    >;
  }

  async addMember(serverId: string, userId: string) {
    // TODO
  }

  async addChannel(serverId: string, channelId: string) {
    // TODO
  }
}
