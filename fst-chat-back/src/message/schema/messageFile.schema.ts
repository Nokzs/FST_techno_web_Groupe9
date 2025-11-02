import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document } from 'mongoose';

@Schema()
export class MessageFile extends Document {
  @ApiProperty({ description: "L'ID unique du fichier joint au message" })
  @Prop({ required: true })
  originalName: string;

  @ApiProperty({
    description: "L'URL d'accès au fichier joint au message",
  })
  @Prop()
  url?: string;

  @ApiProperty({ description: 'Le mimetype du fichier' })
  @Prop({ required: true })
  mimetype: string;

  @ApiProperty({
    description: 'Le mimetype original du fichier avant compression',
  })
  @Prop({ required: true })
  originalMymeType: string;
}

export const MessageFileSchema = SchemaFactory.createForClass(MessageFile);
