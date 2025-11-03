import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserLiteDto {
  @Expose()
  @ApiProperty({
    description: "id de l'utilisateur",
  })
  _id: string;

  @ApiProperty({
    description: "pseudo de l'utilisateur",
  })
  @Expose()
  pseudo: string;

  @ApiProperty({
    description: "url de la photo de profil de l'utilisateur",
  })
  @Expose()
  urlPicture?: string;
}
