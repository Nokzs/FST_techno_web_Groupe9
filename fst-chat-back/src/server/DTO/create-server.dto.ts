import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Role } from '../../roles/role.enum';

export class CreateServerDto {
  @IsString()
  name: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  members?: string[];

  @IsOptional()
  @IsString()
  inviteCode?: string;

  @IsOptional()
  @IsEnum(Role)
  defaultRole?: Role; // MEMBER ou READER (par défaut MEMBER)
}
