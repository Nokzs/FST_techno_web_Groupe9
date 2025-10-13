
import { IsString, IsOptional, IsNumber, IsUrl } from 'class-validator';

export class MessageFileDto {
  @IsString()
  fileName: string; // nom dans le bucket (uuid.ext)

  @IsString()
  originalName: string;

  @IsOptional()
  @IsUrl()
  url?: string; // URL publique ou signée

  @IsString()
  mimetype: string;

  @IsNumber()
  size: number;
}
