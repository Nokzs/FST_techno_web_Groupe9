import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Server, ServerDocument } from '../schema/server.schema';
import { CreateServerDto } from '../DTO/create-server.dto';
@Injectable()
export class ServerService {
    constructor(
    @InjectModel(Server.name) private serverModel: Model<ServerDocument>,
  ) {}

  async create(dto: CreateServerDto): Promise<Server> {
    const newServer = new this.serverModel(dto);
    return newServer.save();
  }

  async findAll(): Promise<Server[]> {
    return this.serverModel.find().lean().exec();
  }

  async addMember(serverId: string, userId: string) {
     //TODO
  }

   async addChannel(serverId: string, channelId: string) {
    //TODO
  }


    
}
