import { Exclude, Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { UserLiteDto } from '../../user/DTO/UserLiteDto';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class ReactionDto {
  @Expose()
  @ApiProperty({
    description: "L'emoji utilisée pour la réaction",
    example: '👍',
  })
  emoji: string;

  @Expose()
  @ApiProperty({
    description: "L'utilisateur qui a réagi",
    type: UserLiteDto,
  })
  @ValidateNested()
  @Type(() => UserLiteDto)
  userId: UserLiteDto;
}
