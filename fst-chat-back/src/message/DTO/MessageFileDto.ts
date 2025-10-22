import { IsString, IsOptional, IsUrl } from 'class-validator';

export class MessageFileDto {
  @IsString()
  originalName: string;

  @IsOptional()
  @IsUrl()
  url?: string; // URL publique ou signée

  @IsString()
  mimetype: string;
}
