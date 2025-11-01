// create-message.dto.ts
import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  senderId: string;

  @IsOptional()
  @IsString()
  receiverId?: string; // pour r�pondre � quelqu'un dans un channel

  @IsString()
  channelId: string; // salon

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  detectedLanguage?: string;

  @IsOptional()
  @IsObject()
  translations?: Record<string, string>;
}
