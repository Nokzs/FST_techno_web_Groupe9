import { IsString, IsOptional, IsArray } from 'class-validator';

export class MessageDto {
  @IsOptional()
  @IsString()
  _id?: string; // g�n�r� automatiquement par MongoDB

  @IsString()
  senderId: string;

  // Pseudo de l'exp�diteur, enrichi via populate (non stock� en base)
  @IsOptional()
  @IsString()
  senderPseudo?: string;

  @IsOptional()
  @IsString()
  receiverId?: string; // si r�ponse � quelqu'un

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
