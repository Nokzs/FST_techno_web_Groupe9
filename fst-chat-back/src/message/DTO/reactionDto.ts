import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ReactionDto {
  @Expose()
  emoji: string;

  @Expose()
  userId: string;
}
