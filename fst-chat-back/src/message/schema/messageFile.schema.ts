import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MessageFile extends Document {
  @Prop({ required: true })
  originalName: string;

  @Prop()
  url?: string;

  @Prop({ required: true })
  mimetype: string;
}

export const MessageFileSchema = SchemaFactory.createForClass(MessageFile);
