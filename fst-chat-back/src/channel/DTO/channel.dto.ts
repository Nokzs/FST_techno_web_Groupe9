// src/channels/dto/channel.dto.ts
import { IsString, IsOptional, IsMongoId } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
@Exclude()
export class ChannelDto {
  @Expose()
  @IsMongoId()
  _id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  serverId: string;

  @Expose()
  @IsOptional()
  createdAt?: Date;

  @Expose()
  @IsOptional()
  updatedAt?: Date;
}

