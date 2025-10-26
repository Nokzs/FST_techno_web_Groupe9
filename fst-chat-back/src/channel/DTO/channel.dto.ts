// src/channels/dto/channel.dto.ts
import { IsString, IsOptional, IsMongoId } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ServerDto } from '../../server/DTO/server.dto';
@Exclude()
export class ChannelDto {
  @Expose()
  @IsMongoId()
  _id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  serverId: string | ServerDto;

  @Expose()
  @IsOptional()
  createdAt?: Date;

  @Expose()
  @IsOptional()
  updatedAt?: Date;
}
