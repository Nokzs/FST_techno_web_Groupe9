import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MessageFileDto } from './MessageFileDto';
import { UserLiteDto } from 'src/user/DTO/UserLiteDto';
import { replyMessageDto } from './replyMessage.dto';
import { Exclude, Expose } from 'class-transformer';
import { ReactionDto } from './reactionDto';
import { CompleteUserResponseDto } from '../../user/DTO/UserResponseDto';

@Exclude()
export class MessageDto {
  @Expose()
  @IsOptional()
  @IsString()
  _id?: string; // généré automatiquement par MongoDB

  @Expose()
  @ValidateNested()
  @Type(() => UserLiteDto)
  senderId: UserLiteDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => UserLiteDto)
  receiverId?: UserLiteDto; // si réponse à quelqu'un

  @Expose()
  @IsString()
  channelId: string;

  @Expose()
  @IsString()
  content: string;

  @Expose()
  @IsOptional()
  @IsArray()
  readBy?: CompleteUserResponseDto[];

  @Expose()
  @IsOptional()
  createdAt?: Date;

  @Expose()
  @IsOptional()
  updatedAt?: Date;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MessageFileDto)
  files?: MessageFileDto[];

  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => replyMessageDto)
  replyMessage?: replyMessageDto;

  @Expose()
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReactionDto)
  reactions?: ReactionDto[];
}
