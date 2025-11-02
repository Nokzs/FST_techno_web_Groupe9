// src/server/dto/server.dto.ts
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Role } from '../../roles/role.enum';

export class ServerDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  description?: string;

  @IsOptional()
  @IsArray()
  members?: string[];

  @IsOptional()
  @IsArray()
  channels?: string[];

  @IsOptional()
  @IsString()
  inviteCode?: string;

  @IsOptional()
  @IsEnum(Role)
  defaultRole?: Role;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
