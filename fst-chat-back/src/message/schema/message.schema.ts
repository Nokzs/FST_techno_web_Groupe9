import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { MessageFile, MessageFileSchema } from './messageFile.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: String, ref: 'User', required: true })
  senderId: string;

  @Prop({ type: String, ref: 'User', required: false })
  receiverId?: string;

  @Prop({ type: String, ref: 'Channel', required: true })
  channelId: string;

  @Prop({ required: false })
  content: string;

  @Prop({ type: [MessageFileSchema], default: [] })
  files: MessageFile[];

  @Prop({ type: [String], ref: 'User', default: [] })
  readBy: string[];

  @Prop({ type: String, ref: 'Message' })
  replyMessage?: string;

  @Prop({ type: [String], ref: 'Reaction', default: [] })
  reactions: string[];

  // 🟢 Ajout pour la traduction automatique
  @Prop({ type: String, required: false })
  detectedLanguage?: string;

  @Prop({ type: Object, default: {} })
  translations?: Record<string, string>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
