import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema()
export class Notification {
  @ApiProperty({ description: "L'ID du canal associé à la notification" })
  @Prop({ required: true })
  channelId: string;

  @ApiProperty({ description: "L'ID du message associé à la notification" })
  @Prop({ required: true })
  messageId: string; // l'ID du message lié à la notification

  @ApiProperty({
    description: 'La liste des IDs des utilisateurs qui ont vu la notification',
  })
  @Prop({ type: [String], default: [] })
  seenBy: string[]; // tableau des userId qui ont vu la notification

  @ApiProperty({ description: "L'ID du serveur associé à la notification" })
  @Prop({ required: true })
  serverId: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
