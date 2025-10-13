import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class MessageFile extends Document {
  @Prop({ required: true })
  originalName: string; // nom original

  @Prop()
  url?: string; // URL signée ou publique

  @Prop({ required: true })
  mimetype: string; // image/png, application/pdf, video/mp4...
}

export const MessageFileSchema = SchemaFactory.createForClass(MessageFile);
