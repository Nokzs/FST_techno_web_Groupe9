// src/channels/dto/channel.dto.ts
import { Exclude, Expose } from 'class-transformer';
import { ServerDto } from '../../server/DTO/server.dto';
import { ApiProperty } from '@nestjs/swagger';
/**
 * Dto d'une notification d'un salon
 * contient les champs _id, channelId, serverId, seenBy
 */
@Exclude()
export class NotificationDto {
  @ApiProperty({
    description: 'id de la notification',
    type: String,
    example: '5f8f8c44b54764421b7156c7',
  })
  @Expose()
  _id: string;

  @ApiProperty({
    description: 'id du salon',
    type: String,
    example: '5f8f8c44b54764421b7156c7',
  })
  @Expose()
  channelId: string;

  @ApiProperty({
    description: 'id du server',
    example: '5f8f8c44b54764421b7156c7',
  })
  @Expose()
  serverId: string | ServerDto;

  @ApiProperty({
    description: 'id des utilisateurs qui ont vu la notif',
    type: String,
    isArray: true,
  })
  @Expose()
  seenBy: string[];
}
