import { IsString, IsOptional, IsUrl } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class MessageFileDto {
  @Expose()
  @IsString()
  _id: string;

  @Expose()
  @IsString()
  originalName: string;

  @Expose()
  @IsOptional()
  @IsUrl()
  url?: string; // URL publique ou signée

  @Expose()
  @IsString()
  mimetype: string;

  @Expose()
  @IsString()
  originalMymeType: string;
}
