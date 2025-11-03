import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../roles/role.enum';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class ServerDto {
  @ApiProperty({
    description: 'id du serveur',
    example: ' 5f8f8c44b54764421b7156c7',
  })
  @IsString()
  @Expose()
  _id: string;

  @ApiProperty({
    description: 'nom du serveur',
    example: ' mon super serveur ',
  })
  @IsString()
  @Expose()
  name: string;

  @ApiProperty({
    description: 'id du propriétaire du serveur',
    example: '0c5f8c44b54764421b7156c7',
  })
  @Expose()
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: 'description du serveur',
    example: 'Ceci est un serveur pour discuter entre amis',
  })
  @Expose()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'membres du serveur',
  })
  @Expose()
  @IsOptional()
  @IsArray()
  members?: string[];

  @ApiProperty({
    description: 'liste des ids des channels du serveur',
    example: '[ "5f8f8c44b54764421b7156c7", "5f8f8c44b54764421b7156c8" ]',
  })
  @Expose()
  @IsOptional()
  @IsArray()
  channels?: string[];

  @ApiProperty({
    description: "code d'invitation du serveur",
    example: '1565',
  })
  @IsOptional()
  @IsString()
  @Expose()
  inviteCode?: string;

  @ApiProperty({
    description: 'rolepar défaut des nouveaux membres',
  })
  @IsOptional()
  @IsEnum(Role)
  @Expose()
  defaultRole?: Role;

  @ApiProperty({
    description: 'date de création du serveur',
    example: '2020-10-19T14:45:24.000Z',
  })
  @Expose()
  @IsOptional()
  createdAt?: Date;

  @ApiProperty({
    description: 'date de modification du serveur',
    example: '2020-10-19T14:45:24.000Z',
  })
  @Expose()
  @IsOptional()
  updatedAt?: Date;

  @ApiProperty({
    description: 'liste des tags associés au serveur',
    example: ['gaming', 'friends', 'work'],
  })
  @Expose()
  @IsArray()
  tags: string[];

  @ApiProperty({
    description: 'indique si le serveur est public ou privé',
  })
  @Expose()
  @IsBoolean()
  isPublic: boolean;
}
