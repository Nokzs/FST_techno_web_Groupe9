import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Role } from '../../roles/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServerDto {
  @ApiProperty({
    description: 'nom du serveur',
    example: 'Mon Super Serveur',
  })
  @IsString()
  name: string;
  @ApiProperty({
    description: 'id du propriétaire du serveur',
    example: '0c5f8c44b54764421b7156c7',
  })
  @IsString()
  ownerId: string;

  @ApiProperty({
    description: 'description du serveur',
    example: 'Ceci est un serveur pour discuter entre amis',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'id des membres du serveur',
    example: ['0c5f8c44b54764421b7156c7', '1a2b3c4d5e6f7g8h9i0jklmn'],
  })
  @IsArray()
  members?: string[];

  @ApiProperty({
    description: "code d'invitation du serveur",
    example: '6266',
  })
  @IsOptional()
  @IsString()
  inviteCode?: string;

  @ApiProperty({
    description: 'Role par défaut des nouveaux membres',
  })
  @IsOptional()
  @IsEnum(Role)
  defaultRole?: Role; // MEMBER ou READER (par défaut MEMBER)
}
