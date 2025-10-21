import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
export class Reaction {
  @Prop({ required: true })
  emoji: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
