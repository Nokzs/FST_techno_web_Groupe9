import { IsString, IsOptional, IsArray } from 'class-validator';

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
}
