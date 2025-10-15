// src/channels/dto/create-channel.dto.ts
import { IsString } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  name: string;

  @IsString()
  serverId: string;
}
