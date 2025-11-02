import { IsString, IsOptional, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
import { Role } from '../../roles/role.enum';

@Exclude()
export class ServerDto {
  @IsString()
  @Expose()
  _id: string;

  @IsString()
  @Expose()
  name: string;

  @Expose()
  @IsString()
  ownerId: string;

  @Expose()
  @IsOptional()
  description?: string;

  @Expose()
  @IsOptional()
  @IsArray()
  members?: string[];

  @Expose()
  @IsOptional()
  @IsArray()
  channels?: string[];

  @IsOptional()
  @IsString()
  @Expose()
  inviteCode?: string;

  @IsOptional()
  @IsEnum(Role)
  @Expose()
  defaultRole?: Role;

  @Expose()
  @IsOptional()
  createdAt?: Date;

  @Expose()
  @IsOptional()
  updatedAt?: Date;

  @Expose()
  @IsArray()
  tags: string[];

  @Expose()
  @IsBoolean()
  isPublic: boolean;
}
