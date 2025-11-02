import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Server, ServerDocument } from '../schema/server.schema';
import { CreateServerDto } from '../DTO/create-server.dto';
import { S } from 'node_modules/react-router/dist/development/routeModules-DnUHijGz';
import { CompleteUserResponseDto } from '../../user/DTO/UserResponseDto';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class ServerService {
  constructor(
    @InjectModel(Server.name) private serverModel: Model<ServerDocument>
  ) {}

  private async generateUniqueInviteCode(len = 10): Promise<string> {
    for (let i = 0; i < 5; i++) {
      const code = randomBytes(8).toString('base64url').slice(0, len);
      const exists = await this.serverModel.exists({ inviteCode: code });
      if (!exists) return code;
    }
    // on allonge le code si code unique pas trouvé
    return randomBytes(12).toString('base64url').slice(0, len + 4);
  }

  async create(dto: CreateServerDto): Promise<Server> {
    const inviteCode = dto.inviteCode ?? (await this.generateUniqueInviteCode());
    const newServer = new this.serverModel({ ...dto, inviteCode });
    const saved = await newServer.save();
    return saved.toObject();
  }

  async findAll(): Promise<Server[]> {
    return this.serverModel.find().lean().exec();
  }

  async findById(id: string): Promise<Server | null> {
    return this.serverModel.findById(id).lean().exec();
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
    // Utiliser $addToSet pour éviter les doublons en concurrence
    await this.serverModel.updateOne(
      { _id: server._id },
      { $addToSet: { members: uid } }
    ).exec();
    const updated = await this.serverModel.findById(server._id).lean().exec();
    return updated as unknown as Server;
  }

  async leaveServer(serverId: string, userId: string): Promise<Server | null> {
    const sid = new Types.ObjectId(serverId);
    const uid = new Types.ObjectId(userId);
    await this.serverModel
      .updateOne({ _id: sid }, { $pull: { members: uid } })
      .exec();
    const updated = await this.serverModel.findById(sid).lean().exec();
    return (updated || null) as unknown as Server | null;
  }

  async getMembersByServerId(serverId: string): Promise<CompleteUserResponseDto[]> {
    const srv = await this.serverModel
      .findById(serverId)
      .populate('members', 'pseudo email urlPicture bio')
      .lean()
      .exec();
    if (!srv) return [];
    const members = (srv as any).members as any[];
    return (members || []).map((m) =>
      plainToInstance(CompleteUserResponseDto, {
        id: m._id?.toString?.() ?? m.id,
        pseudo: m.pseudo,
        email: m.email,
        urlPicture: m.urlPicture,
        bio: m.bio,
      })
    );
  }

  async deleteById(serverId: string): Promise<boolean> {
    const res = await this.serverModel.deleteOne({ _id: new Types.ObjectId(serverId) }).exec();
    return (res?.deletedCount ?? 0) > 0;
  }
}
