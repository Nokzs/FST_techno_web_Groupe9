import { IsString, IsOptional } from 'class-validator';

export class CreateServerDto {
  @IsString()
  name: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  description?: string;
}
