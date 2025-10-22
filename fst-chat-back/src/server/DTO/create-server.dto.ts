import { IsString, IsOptional, IsArray, IsNumberString } from 'class-validator';

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

  @IsNumberString()
  inviteCode: string;
}
