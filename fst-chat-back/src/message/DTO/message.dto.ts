import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageFileDto } from './MessageFileDto';
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

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
  
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageFileDto)
  files?: MessageFileDto[];

  

}
