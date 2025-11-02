import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RoleAssignment, RoleAssignmentDocument } from './schema/role-assignment.schema';
import { Role } from './role.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(RoleAssignment.name)
    private readonly roleModel: Model<RoleAssignmentDocument>
  ) {}

  async getUserRole(serverId: string, userId: string): Promise<Role | null> {
    const doc = await this.roleModel
      .findOne({ serverId: new Types.ObjectId(serverId), userId: new Types.ObjectId(userId) })
      .lean()
      .exec();
    return (doc?.role as Role) ?? null;
  }

  async setUserRole(serverId: string, userId: string, role: Role): Promise<void> {
    await this.roleModel.updateOne(
      { serverId: new Types.ObjectId(serverId), userId: new Types.ObjectId(userId) },
      { $set: { role } },
      { upsert: true }
    ).exec();
  }

  async getServerRoles(serverId: string): Promise<Record<string, Role>> {
    const docs = await this.roleModel.find({ serverId: new Types.ObjectId(serverId) }).lean().exec();
    const out: Record<string, Role> = {};
    for (const d of docs) out[(d.userId as any).toString?.() ?? String(d.userId)] = d.role as Role;
    return out;
  }
}

