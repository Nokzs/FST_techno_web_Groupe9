import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MessageFile, MessageFileSchema } from './messageFile.schema';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongodb';
export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  _id: Types.ObjectId;

  // Indique si le message est encore en cours d'envoi/upload côté client
  @ApiProperty({ description: "Indique si le message est en cours d'envoi" })
  @Prop({ type: Boolean, default: false })
  sending: boolean;

  @ApiProperty({
    description:
      'La description du message sous forme de chiffres afin de numériser le sens de la phrase',
  })
  @Prop({ type: [Number], default: [] })
  embedding: number[];

  //permet d'optimiser la fonctionnalité de question/réponse du chatbot
  @ApiProperty({ description: "La norme de l'embedding du message" })
  @Prop({ type: Number, default: 0 })
  embeddingNorm: number;

  @ApiProperty({ description: "L'ID de l'utilisateur qui a envoyé le message" })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  senderId: Types.ObjectId;

  @ApiProperty({
    description: "L'ID de l'utilisateur à qui le message est destiné",
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  receiverId?: Types.ObjectId;

  @ApiProperty({ description: "L'ID du salon" })
  @Prop({ type: Types.ObjectId, ref: 'Channel', required: true })
  channelId: Types.ObjectId;

  @ApiProperty({ description: 'Le contenu du message' })
  @Prop({ default: '' })
  content: string;

  // Liste des fichiers attachés
  @ApiProperty({
    description: 'La liste des fichiers attachés au message',
    type: MessageFile,
    isArray: true,
  })
  @Prop({ type: [MessageFileSchema], default: [] })
  files: MessageFile[];

  // Liste des utilisateurs qui ont lu le message
  @ApiProperty({
    description: 'la liste des ids des utilisateurs qui ont vu le message',
    example: '4ecbe7f9e8c1c9092c000027',
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  readBy: Types.ObjectId[];

  @ApiProperty({
    description: 'si le message répond à un autre',
    example: '4ecbe7f9e8c1c9092c000027',
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'Message', required: false })
  replyMessage: Types.ObjectId;

  @ApiProperty({
    description: 'la liste des réactions à ce message',
    type: Types.ObjectId,
    isArray: true,
  })
  @Prop({ type: [{ type: Types.ObjectId, ref: 'Reaction' }], default: [] })
  reactions: Types.ObjectId[];

  @ApiProperty({
    description: "l'indicateur qui indique si le message à été supprimer",
  })
  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;

  @ApiProperty({
    description: "l'indicateur qui indique si le message est epinglé ou non",
  })
  @Prop({ type: Boolean, default: false })
  isPin: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
