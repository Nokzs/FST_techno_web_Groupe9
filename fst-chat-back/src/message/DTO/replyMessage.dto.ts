import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { Exclude, Expose } from 'class-transformer';
@Exclude()
export class replyMessageDto {
  @Expose()
  @IsOptional()
  @IsString()
  _id?: string; // généré automatiquement par MongoDB

  @Expose()
  @IsString()
  content: string;

  @Expose()
  @IsOptional()
  createdAt?: Date;

  @Expose()
  @IsOptional()
  @IsBoolean()
  isDeleted: boolean;
}
