import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
    return randomBytes(12)
      .toString('base64url')
      .slice(0, len + 4);
  }

  async create(dto: CreateServerDto): Promise<Server> {
    const inviteCode =
      dto.inviteCode ?? (await this.generateUniqueInviteCode());
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
    await this.serverModel
      .updateOne({ _id: server._id }, { $addToSet: { members: uid } })
      .exec();
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

  async getMembersByServerId(
    serverId: string
  ): Promise<CompleteUserResponseDto[]> {
    const srv = await this.serverModel
      .findById(serverId)
      .populate('members', 'pseudo email urlPicture bio')
      .lean()
      .exec();
    if (!srv) return [];
    const members = (srv as any).members as any[];

    return (members || []).map((m) => {
      return plainToInstance(CompleteUserResponseDto, {
        id: m._id?.toString?.() ?? m.id,
        pseudo: m.pseudo,
        email: m.email,
        urlPicture: m.urlPicture,
        bio: m.bio,
      });
    });
  }

  async deleteById(serverId: string): Promise<boolean> {
    const res = await this.serverModel
      .deleteOne({ _id: new Types.ObjectId(serverId) })
      .exec();
    return (res?.deletedCount ?? 0) > 0;
  }
  async getFromChannelId(channelId: string): Promise<Server | null> {
    return this.serverModel.findOne({ channels: channelId }).lean().exec();
  }
  async getServerFromId(serverId: string): Promise<Server | null> {
    return await this.serverModel.findById(serverId);
  }
  async openServer(
    serverId: string,
    tags: string[],
    userId: string
  ): Promise<Server | null> {
    const server = await this.serverModel
      .findByIdAndUpdate(
        { _id: serverId },
        { isPublic: true, tags },
        { new: true }
      )
      .exec();

    if (server?.ownerId.toString() !== userId) {
      throw new UnauthorizedException('vous devez être le propriétaire');
    }
    if (!server) {
      return null;
    }
    return server;
  }
  async closeServer(serverId: string, userId: string): Promise<Server | null> {
    const server = await this.serverModel
      .findByIdAndUpdate({ _id: serverId }, { isPublic: false }, { new: true })
      .exec();

    if (server?.ownerId.toString() !== userId) {
      throw new UnauthorizedException('vous devez être le propriétaire');
    }
    if (!server) {
      return null;
    }
    return server;
  }
  async joinOpen(serverId: string, userId: string): Promise<Server | null> {
    const server = await this.serverModel.findById(serverId).exec();
    if (!server) throw new NotFoundException('serverId invalide');
    if (!server.members.some((m) => m.toString() === userId)) {
      server.members.push(new Types.ObjectId(userId));
      await server.save();
      return server;
    }
    return null;
  }
  async searchServersWithCursor(
    searchName: string,
    searchTags: string,
    userId: string,
    limit = 20,
    lastId?: string
  ): Promise<Server[]> {
    const name = searchName.trim().toLowerCase();
    const tags = searchTags
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter((tag) => tag !== '');

    const query: any = { $and: [] };

    // ✅ Toujours filtrer par serveurs publics
    query.$and.push({ isPublic: true });

    // ✅ L'utilisateur ne doit pas être déjà membre
    query.$and.push({ members: { $nin: [userId] } });

    // 🔍 Filtre par nom
    if (name) {
      query.$and.push({
        name: { $regex: name, $options: 'i' },
      });
    }

    // 🔍 Filtre par tags
    if (tags.length > 0) {
      const fixedTags = tags.slice(0, -1);
      const lastTag = tags[tags.length - 1];

      if (fixedTags.length > 0) {
        query.$and.push({ tags: { $all: fixedTags } });
      }

      if (lastTag) {
        query.$and.push({
          tags: { $elemMatch: { $regex: `^${lastTag}`, $options: 'i' } },
        });
      }
    }

    // 🔁 Pagination par curseur
    if (lastId?.trim()) {
      query.$and.push({ _id: { $lt: new Types.ObjectId(lastId) } });
    }

    if (query.$and.length === 0) delete query.$and;

    // ⚡ Exécution optimisée
    return this.serverModel
      .find(query)
      .sort({ _id: -1 }) // plus récent d’abord
      .limit(limit)
      .exec();
  }
}
