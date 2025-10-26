import { IsString, IsOptional, IsArray } from 'class-validator';

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
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;
}
