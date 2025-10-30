import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Notification {
  @Prop({ required: true })
  channelId: string;

  @Prop({ required: true })
  messageId: string; // l'ID du message lié à la notification

  @Prop({ type: [String], default: [] })
  seenBy: string[]; // tableau des userId qui ont vu la notification

  @Prop({ required: true })
  serverId: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
