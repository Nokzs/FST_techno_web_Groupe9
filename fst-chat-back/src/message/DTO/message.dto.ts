import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MessageFileDto } from './MessageFileDto';
import { UserLiteDto } from '../../user/DTO/UserLiteDto';
import { replyMessageDto } from './replyMessage.dto';
import { Exclude, Expose } from 'class-transformer';
import { ReactionDto } from './reactionDto';
import { CompleteUserResponseDto } from '../../user/DTO/UserResponseDto';
import { ApiProperty } from '@nestjs/swagger';
/**
 * DTO représentant un message dans le système de chat.
 * Ce DTO inclut des informations sur l'expéditeur, le contenu,
 * les fichiers attachés, les réactions, et d'autres métadonnées.
 * Il est utilisé pour transférer les données de message entre le client et le serveur.
 */
@Exclude()
export class MessageDto {
  @Expose()
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'ID unique du message généré par MongoDB',
    example: '60d21b4667d0d8992e610c85',
  })
  _id?: string; // généré automatiquement par MongoDB

  @Expose()
  @ApiProperty({
    description: " Informations sur l'expéditeur du message",
    type: UserLiteDto,
  })
  @ValidateNested()
  @Type(() => UserLiteDto)
  senderId: UserLiteDto;

  @Expose()
  @IsOptional()
  @ValidateNested()
  @ApiProperty({
    description:
      ' Informations sur le receveur du message en cas de réponse à ce message ',
    type: UserLiteDto,
  })
  @Type(() => UserLiteDto)
  receiverId?: UserLiteDto; // si réponse à quelqu'un

  @Expose()
  @ApiProperty({
    description: 'ID du salon où le message est envoyé',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsString()
  channelId: string;

  @Expose()
  @ApiProperty({
    description: 'Contenu textuel du message',
    example: 'Bonjour, comment ça va ?',
  })
  @IsString()
  content: string;

  @Expose()
  @IsOptional()
  @IsArray()
  @ApiProperty({
    description: 'Liste des utilisateurs ayant lu le message',
    type: CompleteUserResponseDto,
  })
  readBy?: CompleteUserResponseDto[];

  @Expose()
  @ApiProperty({
    description: 'Date de création du message',
    example: '2023-10-05T14:48:00.000Z',
  })
  @IsOptional()
  createdAt?: Date;

  @Expose()
  @ApiProperty({
    description: 'Date de la dernière mise à jour du message',
    example: '2023-10-05T15:00:00.000Z',
  })
  @IsOptional()
  updatedAt?: Date;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageFileDto)
  @ApiProperty({
    description: 'Liste des fichiers attachés au message',
    type: MessageFileDto,
    isArray: true,
  })
  files?: MessageFileDto[];

  @Expose()
  @IsOptional()
  @ValidateNested()
  @ApiProperty({
    description: 'Informations sur le message auquel ce message répond',
    type: replyMessageDto,
  })
  @Type(() => replyMessageDto)
  replyMessage?: replyMessageDto;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReactionDto)
  @ApiProperty({
    description: 'Liste des réactions associées au message',
    type: ReactionDto,
    isArray: true,
  })
  reactions?: ReactionDto[];

  @Expose()
  @IsBoolean()
  @ApiProperty({
    description:
      "Indique si le message est encore en cours de validation ou d'upload",
  })
  sending: boolean; // indique si le message est encore en cours de validation / upload

  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: 'Indique si le message a été supprimé',
  })
  isDeleted?: boolean;

  @Expose()
  @IsBoolean()
  @ApiProperty({
    description: 'Indique si le message est épinglé',
  })
  isPin: boolean;
}
