import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Role } from '../role.enum';

export type RoleAssignmentDocument = HydratedDocument<RoleAssignment>;

@Schema({ timestamps: true, collection: 'server_roles' })
export class RoleAssignment {
  @Prop({ type: Types.ObjectId, ref: 'Server', index: true, required: true })
  serverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', index: true, required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: Object.values(Role), required: true })
  role: Role;
}

export const RoleAssignmentSchema = SchemaFactory.createForClass(RoleAssignment);
RoleAssignmentSchema.index({ serverId: 1, userId: 1 }, { unique: true });

