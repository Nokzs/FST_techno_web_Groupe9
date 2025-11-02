// src/server/schema/server.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { HydratedDocument, Types } from 'mongoose';

export type ServerDocument = HydratedDocument<Server>;

@Schema({ timestamps: true })
export class Server {
  @ApiProperty({
    description: 'le nom du serveur',
    example: 'FST-Server',
  })
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  @ApiProperty({
    description: "l'id du créateur du serveur",
  })
  ownerId: Types.ObjectId;

  @Prop({ required: false })
  @ApiProperty({
    description:
      'Une description du serveur qui sera visible lors de la recherche',
  })
  description?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  @ApiProperty({
    description: 'la liste des membres du serveur',
  })
  members: Types.ObjectId[]; // tous les membres du serveur

  @ApiProperty({
    description: 'la liste des channels',
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Channel' }] })
  channels: Types.ObjectId[]; // les salons

  // Code d'invitation numérique pour rejoindre le serveur
  @ApiProperty({
    description: "le code d'invitation du serveur",
  })
  @Prop({ required: true, unique: true, index: true })
  inviteCode: string;

  @ApiProperty({
    description:
      'indicateur qui indique si le serveur est visible dans la recherche ou non',
  })
  @Prop({ type: Boolean, default: false })
  isPublic: boolean;

  @ApiProperty({
    description: 'la liste des tag associé aux serveur',
  })
  @Prop({ type: [String], default: [] })
  tags: string[];

  // Rôle par défaut attribué aux nouveaux membres (MEMBER ou READER)
  @Prop({ required: false, enum: ['MEMBER', 'READER'], default: 'MEMBER' })
  defaultRole?: string;
}

export const ServerSchema = SchemaFactory.createForClass(Server);
