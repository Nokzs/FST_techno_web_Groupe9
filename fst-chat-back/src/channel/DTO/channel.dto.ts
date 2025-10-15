// src/channels/dto/channel.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class ChannelDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  serverId: string;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
