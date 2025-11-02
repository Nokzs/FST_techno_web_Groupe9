import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

@Schema()
export class Reaction {
  @ApiProperty({ description: "L'emoji utilisé pour la réaction" })
  @Prop({ required: true })
  emoji: string;

  @ApiProperty({ description: "L'ID de l'utilisateur qui a réagi" })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;
}

export const ReactionSchema = SchemaFactory.createForClass(Reaction);
