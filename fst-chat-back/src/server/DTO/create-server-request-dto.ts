import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Role } from '../../roles/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServerRequestDto {
  @ApiProperty({
    description: 'nom du serveur',
    example: 'Mon Super Serveur',
  })
  @IsString()
  name: string;
  @ApiProperty({
    description: 'description du serveur',
    example: 'Ceci est un serveur pour discuter entre amis',
  })
  @IsOptional()
  @IsString()
  description?: string;
  // inviteCode généré automatiquement par le backend

  @ApiProperty({
    description: 'role par défaut des nouveaux membres',
    example: 'MEMBER',
  })
  @IsOptional()
  @IsEnum(Role)
  defaultRole?: Role; // MEMBER ou READER
}
