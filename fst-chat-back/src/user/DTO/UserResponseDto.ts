import { Exclude, Expose } from 'class-transformer';
@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;
}

@Exclude()
export class CompleteUserResponseDto {
 
  @Expose()
  pseudo: string;

  @Expose()
  email: string;

  @Expose()
  createdAt: Date;

  @Expose()
  lastConnectedAt: Date;

  @Expose()
  language: string;

  @Expose()
  bio: string;

  @Expose()
  urlPicture: string;
}
