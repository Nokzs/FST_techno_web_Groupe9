// src/channels/dto/create-channel.dto.ts
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de création d'un salon.
 * Contient les champs name et serverId.
 */

export class CreateChannelDto {
  @IsString()
  @ApiProperty({
    description: 'nom du salon',
    example: 'accueil',
  })
  name: string;

  @ApiProperty({
    description: 'id du serveur associée au channel',
    example: '5f8f8c44b54764421b7156c7',
  })
  @IsString()
  serverId: string;
}
