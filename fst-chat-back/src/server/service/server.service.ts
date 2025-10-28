import { Injectable, Logger,NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    return this.serverModel.find().lean().exec();
  }

  async findByUserId(userId: any): Promise<Server[]> {
    return this.serverModel
      .find({ members: new Types.ObjectId(userId) })
      .lean()
      .exec();
  }

  async addMember(serverId: string, userId: string) {
    //TODO
  }

  async addChannel(serverId: string, channelId: string) {
    //TODO
  }

  async joinByInviteCode(userId: string, code: string): Promise<Server | null> {
    const server = await this.serverModel.findOne({ inviteCode: code }).exec();
    if (!server) return null;
    const uid = new Types.ObjectId(userId);
    if (!server.members.some((m) => new Types.ObjectId(m).equals(uid))) {
      server.members.push(uid);
      await server.save();
    }
    return server.toObject();
  }
  async getFromChannelId(channelId: string): Promise<Server | null> {
    Logger.log('channelId', channelId);
    return this.serverModel.findOne({ channels: channelId }).lean().exec();
  }
  async getServerFromId(serverId: string): Promise<Server | null> {
    return await this.serverModel.findById(serverId);
  }
  async openServer(serverId: string, tags: string[]): Promise<Server | null> {
    const server = await this.serverModel
      .findByIdAndUpdate(serverId, { isPublic: true, tags }, { new: true })
      .exec();

    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }
  }
}
