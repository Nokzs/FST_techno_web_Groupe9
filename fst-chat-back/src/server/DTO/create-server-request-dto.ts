import { IsOptional, IsString, IsEnum } from 'class-validator';
import { Role } from '../../roles/role.enum';

export class CreateServerRequestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
  // inviteCode généré automatiquement par le backend

  @IsOptional()
  @IsEnum(Role)
  defaultRole?: Role; // MEMBER ou READER
}
