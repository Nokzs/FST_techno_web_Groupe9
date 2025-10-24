import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageFileDto } from './MessageFileDto';
import { replyMessageDto } from './replyMessage.dto';

export class CreateMessageDto {
  @IsMongoId()
  senderId: string;

  @IsOptional()
  @IsString()
  receiverId?: string; // pour messages privés

  @IsOptional()
  @IsString()
  channelId?: string; // pour messages de salon

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageFileDto)
  files?: MessageFileDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => replyMessageDto)
  replyMessage?: replyMessageDto; // pour les réponses

  // Indique si le message est en cours d'envoi/upload côté client
  @IsOptional()
  @IsBoolean()
  sending?: boolean;
}
