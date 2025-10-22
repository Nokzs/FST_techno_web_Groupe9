import { IsString, IsOptional, IsArray } from 'class-validator';

export class MessageDto {
  @IsOptional()
  @IsString()
  _id?: string; // généré automatiquement par MongoDB

  @IsString()
  senderId: string;

  // Pseudo de l'expéditeur, enrichi via populate (non stocké en base)
  @IsOptional()
  @IsString()
  senderPseudo?: string;

  @IsOptional()
  @IsString()
  receiverId?: string; // si réponse à quelqu'un

  @IsString()
  channelId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  readBy?: string[]; // liste des utilisateurs ayant lu le message

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
