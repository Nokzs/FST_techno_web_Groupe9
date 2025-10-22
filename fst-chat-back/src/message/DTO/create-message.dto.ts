// create-message.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  senderId: string;

  @IsString()
  channelId: string; // salon

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  receiverId?: string; // pour répondre à quelqu'un dans un channel

  
}
