import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class responseDto {
  @Expose()
  id: string;

  @Expose()
  pseudo: string;

  @Expose()
  email: string;
}
