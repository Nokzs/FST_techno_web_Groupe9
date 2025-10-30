import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Notification } from './notification.schema';
export type ChannelDocument = HydratedDocument<Channel>;

@Schema({ timestamps: true })
export class Channel {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Server', required: true })
  serverId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ default: [] })
  notification: Notification[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
