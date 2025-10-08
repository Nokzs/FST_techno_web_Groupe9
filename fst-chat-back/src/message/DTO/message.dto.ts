import { IsString, IsOptional, IsArray } from 'class-validator';

export class MessageDto {
  @IsOptional()
  @IsString()
  _id?: string; // généré automatiquement par MongoDB

  @IsString()
  senderId: string;

  @IsOptional()
  @IsString()
  receiverId?: string; // si réponse à quelqu’un

  @IsString()
  channelId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  readBy?: string[]; // liste des utilisateurs ayant lu le message

  @IsOptional() // optionnel car cree automatiquement par mongoose mais on veut le retourner
  createdAt?: Date;

}
