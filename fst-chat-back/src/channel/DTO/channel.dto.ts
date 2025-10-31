// src/channels/dto/channel.dto.ts
import { IsString, IsOptional, IsMongoId } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { NotificationDto } from './NotificationDto';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de transfert d'un salon vers le client.
 * Contient les champs _id, name, serverId, createdAt, updatedAt et les notification.
 */

@Exclude()
export class ChannelDto {
  @ApiProperty({
    description: "l'id de l'objet mongo associée",
    example: '5f8f8c44b54764421b7156c7',
    type: String,
  })
  @Expose()
  @IsMongoId()
  _id: string;

  @ApiProperty({
    description: 'nom du salon',
    example: 'accueil',
    type: String,
  })
  @Expose()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'id du serveur',
    example: '5f8f8c44b54764421b7156c7',
    type: String,
  })
  @Expose()
  @IsString()
  serverId: string;

  @ApiProperty({
    description: 'timeStamp de la création du salon',
    example: '2020-10-19T14:45:24.000Z',
    required: false,
    type: Date,
  })
  @Expose()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    description: 'timeStamp de la dernière modification',
    example: '2020-10-19T14:45:24.000Z',
    type: Date,
  })
  @Expose()
  @IsOptional()
  updatedAt?: Date;

  @ApiProperty({
    description: 'Notifications liées aux salons',
    type: NotificationDto, // type du DTO
    isArray: true, // indique que c’est un tableau
  })
  @Expose()
  notification: NotificationDto[];
}
