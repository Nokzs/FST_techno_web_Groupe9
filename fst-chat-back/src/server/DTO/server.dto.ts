import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
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
