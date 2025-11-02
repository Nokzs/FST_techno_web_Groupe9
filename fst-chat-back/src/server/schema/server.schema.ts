// src/server/schema/server.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ServerDocument = HydratedDocument<Server>;

@Schema({ timestamps: true })
export class Server {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ required: false })
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  members: Types.ObjectId[]; // tous les membres du serveur

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Channel' }] })
  channels: Types.ObjectId[]; // les salons

  // Code d'invitation numérique pour rejoindre le serveur
  @Prop({ required: true, unique: true, index: true })
  inviteCode: string;

  // Rôle par défaut attribué aux nouveaux membres (MEMBER ou READER)
  @Prop({ required: false, enum: ['MEMBER', 'READER'], default: 'MEMBER' })
  defaultRole?: string;
}

export const ServerSchema = SchemaFactory.createForClass(Server);
