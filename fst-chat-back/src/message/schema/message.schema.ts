import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MessageFile, MessageFileSchema } from './messageFile.schema';
export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  receiverId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Channel', required: false })
  channelId?: Types.ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [MessageFileSchema], default: [] })
  files: MessageFile[];

  @Prop({ default: false })
  read: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
