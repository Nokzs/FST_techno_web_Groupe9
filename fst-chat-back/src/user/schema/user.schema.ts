import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: false })
  pseudo: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: false })
  lastConnectedAt: Date;

  @Prop({ default: false })
  isAdmin: boolean;

  @Prop({ default: 'English' })
  language?: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  urlPicture: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
