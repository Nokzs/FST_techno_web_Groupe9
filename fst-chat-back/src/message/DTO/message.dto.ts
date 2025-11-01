import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';

export class MessageDto {
  @IsOptional()
  @IsString()
  _id?: string; // g�n�r� automatiquement par MongoDB

  @IsString()
  senderId: string;

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

  @IsOptional()
  @IsString()
  detectedLanguage?: string;

  @IsOptional()
  @IsObject()
  translations?: Record<string, string>;
}
