import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsMongoId,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageFileDto } from './MessageFileDto';
import { replyMessageDto } from './replyMessage.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    description: "ID de l'expéditeur du message",
    example: '60d21b4667d0d8992e610c85',
  })
  @IsMongoId()
  senderId: string;

  @ApiProperty({
    description: 'ID du receveur du message en cas de réponse à ce message ',
    example: '60d21b4667d0d8992e610c85',
    required: false,
  })
  @IsOptional()
  @IsString()
  receiverId?: string; // pour messages privés

  @ApiProperty({
    description: 'ID du salon où le message est envoyé',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @IsString()
  channelId?: string; // pour messages de salon

  @ApiProperty({
    description: 'Contenu textuel du message',
    example: 'Bonjour, comment ça va ?',
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Liste des fichiers attachés au message',
    type: MessageFileDto,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageFileDto)
  files?: MessageFileDto[];

  @ApiProperty({
    description: 'Informations sur le message auquel ce message répond',
    type: replyMessageDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => replyMessageDto)
  replyMessage?: replyMessageDto; // pour les réponses

  // Indique si le message est en cours d'envoi/upload côté client
  @ApiProperty({
    description: "Indique si le message est en cours d'envoi",
  })
  @IsOptional()
  @IsBoolean()
  sending?: boolean;
}
