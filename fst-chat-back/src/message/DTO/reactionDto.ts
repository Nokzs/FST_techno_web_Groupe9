import { Exclude, Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserLiteDto } from 'src/user/DTO/UserLiteDto';

@Exclude()
export class ReactionDto {
  @Expose()
  emoji: string;

  @Expose()
  @ValidateNested()
  @Type(() => UserLiteDto)
  userId: UserLiteDto;
}
