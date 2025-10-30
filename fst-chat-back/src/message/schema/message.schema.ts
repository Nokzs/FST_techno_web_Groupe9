import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MessageFile, MessageFileSchema } from './messageFile.schema';
export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  _id: Types.ObjectId;

  // Indique si le message est encore en cours d'envoi/upload côté client
  @Prop({ type: Boolean, default: false })
  sending: boolean;

  @Prop({ type: [Number], default: [] })
  embedding: number[];

  //permet d'optimiser la fonctionnalité de question/réponse du chatbot
  @Prop({ type: Number, default: 0 })
  embeddingNorm: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  receiverId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Channel', required: true })
  channelId: Types.ObjectId;

  @Prop({ required: false })
  content: string;

  // Liste des fichiers attachés
  @Prop({ type: [MessageFileSchema], default: [] })
  files: MessageFile[];

  // Liste des utilisateurs qui ont lu le message
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  readBy: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  replyMessage: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Reaction' }], default: [] })
  reactions: Types.ObjectId[];

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
