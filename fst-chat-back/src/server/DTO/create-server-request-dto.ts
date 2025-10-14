import { IsOptional, IsString } from 'class-validator';

export class CreateServerRequestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
