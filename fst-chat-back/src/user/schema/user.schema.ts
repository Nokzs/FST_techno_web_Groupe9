import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  pseudo: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ required: false })
  lastConnectedAt: Date;

  @Prop({ required: true })
  isAdmin: boolean;

  @Prop()
  language: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
