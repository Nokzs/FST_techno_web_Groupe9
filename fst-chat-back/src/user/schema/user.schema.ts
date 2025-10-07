import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

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

  @Prop()
  language?: string;

  @Prop({ default: '' })
  bio: string;

  @Prop({ default: '' })
  urlPicture: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
