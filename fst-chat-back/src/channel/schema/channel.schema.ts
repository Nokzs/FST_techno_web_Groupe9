import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChannelDocument = Channel & Document;

@Schema({ timestamps: true })
export class Channel {
  @Prop({ type: Types.ObjectId, ref: 'Server', required: true })
  serverId: Types.ObjectId;

  @Prop({ required: true })
  name: string;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);
