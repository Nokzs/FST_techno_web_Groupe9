import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;
}

/*@Exclude()
export class CompleteUserResponseDto extends User{
  @expo
}*/
