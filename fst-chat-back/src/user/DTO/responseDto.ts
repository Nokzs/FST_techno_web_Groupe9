import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class responseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;
}
