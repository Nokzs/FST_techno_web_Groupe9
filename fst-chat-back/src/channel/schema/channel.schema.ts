import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Notification } from './notification.schema';
import { ApiProperty } from '@nestjs/swagger';
export type ChannelDocument = HydratedDocument<Channel>;

@Schema({ timestamps: true })
export class Channel {
  @ApiProperty({ description: "L'ID unique du canal" })
  _id: Types.ObjectId;

  @ApiProperty({ description: "L'ID du serveur auquel le canal appartient" })
  @Prop({ type: Types.ObjectId, ref: 'Server', required: true })
  serverId: Types.ObjectId;

  @ApiProperty({ description: 'Le nom du canal' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'la liste des notifications associées au canal' })
  @Prop({ default: [] })
  notification: Notification[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
