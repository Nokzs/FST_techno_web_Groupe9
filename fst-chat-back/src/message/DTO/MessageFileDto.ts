import { IsString, IsOptional, IsUrl } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
/**
 * DTO représentant un fichier attaché à un message dans le système de chat.
 * Ce DTO inclut des informations sur le fichier telles que son nom d'origine,
 * son type MIME, et une URL publique ou signée pour y accéder.
 * Il est utilisé pour transférer les données de fichiers entre le client et le serveur.
 *
 */

export class MessageFileDto {
  @ApiProperty({
    description: 'ID unique du fichier généré par MongoDB',
    example: '60d21b4667d0d8992e610c85',
  })
  @Expose()
  @IsString()
  _id: string;

  @ApiProperty({
    description: "Nom d'origine du fichier",
    example: 'photo.jpg',
  })
  @Expose()
  @IsString()
  originalName: string;

  @ApiProperty({
    description: 'URL publique ou signée pour accéder au fichier',
    example: 's3://bucket-name/photo.jpg?signature=abcd1234',
  })
  @Expose()
  @IsOptional()
  @IsUrl()
  url?: string; // URL publique ou signée

  @ApiProperty({
    description: 'Type MIME du fichier',
    example: 'image/jpeg',
  })
  @Expose()
  @IsString()
  mimetype: string;

  @ApiProperty({
    description: "Type MIME d'origine du fichier avant compression",
    example: 'image/png',
  })
  @Expose()
  @IsString()
  originalMymeType: string;
}
