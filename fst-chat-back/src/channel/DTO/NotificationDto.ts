// src/channels/dto/channel.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { ServerDto } from '../../server/DTO/server.dto';
@Exclude()
export class NotificationDto {
  @Expose()
  _id: string;

  @Expose()
  channelId: string;

  @Expose()
  serverId: string | ServerDto;

  @Expose()
  seenBy: string[];
}
