import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageFileDto } from './MessageFileDto';
export class CreateMessageDto {
  @IsString()
  senderId: string;

  @IsOptional()
  @IsString()
  receiverId?: string; // pour messages privés

  @IsOptional()
  @IsString()
  channelId?: string; // pour messages de salon

  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageFileDto)
  files?: MessageFileDto[];
}
