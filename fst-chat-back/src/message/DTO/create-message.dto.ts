import { IsString, IsOptional } from 'class-validator';

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
}
