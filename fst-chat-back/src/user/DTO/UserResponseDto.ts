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
  password: string;

  @Expose()
  createdAt: Date;

  @Expose()
  isAdmin: boolean;

  @Expose()
  language: string;
}
