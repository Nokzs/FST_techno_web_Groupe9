// src/channels/dto/channel.dto.ts
import { IsString, IsBoolean } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
/**
 * dto d'une commande envoyée
 * il est composé des champs command, channelId, userId,language,useUserLanguage
 */
@Exclude()
export class AskBodyDto {
  @ApiProperty({
    description: 'la commande envoyée au bot ',
    example: '/question quelle est le problème ?',
    type: String,
  })
  @Expose()
  @IsString()
  command: string;

  @Expose()
  @ApiProperty({
    description: "l'id sur salon sur laquelle la question est posée",
    example: '5f8f8c44b54764421b7156c7',
    type: String,
  })
  @IsString()
  channelId: string;

  @ApiProperty({
    description: "l'id du user",
    example: '5f8f8c44b54764421b7156c7',
    type: String,
  })
  @Expose()
  @IsString()
  userId: string;

  @Expose()
  @ApiProperty({
    description: "langue de l'utilisateur",
    example: 'fr',
  })
  @IsString()
  language: string;

  @Expose()
  @ApiProperty({
    description:
      "booléen représentant le fait d'utiliser la langue de l'utilisateur ou celle detecté par le bot",
    type: Boolean,
  })
  @IsBoolean()
  useUserLanguage: boolean;
}
