import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserLiteDto {
  @Expose()
  _id: string;

  @Expose()
  pseudo: string;

  @Expose()
  urlPicture?: string;
}
