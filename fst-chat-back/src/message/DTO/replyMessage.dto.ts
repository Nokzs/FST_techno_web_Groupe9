import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
@Exclude()
export class replyMessageDto {
  @ApiProperty({
    description: "L'identifiant unique du message de réponse",
    example: '60d21b4667d0d8992e610c85',
  })
  @Expose()
  @IsOptional()
  @IsString()
  _id?: string; // généré automatiquement par MongoDB

  @ApiProperty({
    description: 'Le contenu du message de réponse',
    example: 'Ceci est une réponse au message précédent.',
  })
  @Expose()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'La date de création du message de réponse',
    example: '2023-10-05T14:48:00.000Z',
  })
  @Expose()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    description: 'Indique si le message a été supprimé',
    example: false,
  })
  @Expose()
  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}
