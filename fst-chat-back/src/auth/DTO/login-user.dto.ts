import { IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO utilisé pour la connection d'un user.
 * Contient les champs obligatoires `email` et `password`.
 */
export class LoginUserDto {
  @IsEmail()
  @ApiProperty({
    description: "email liée à l'utillisateurs",
    example: 'toto@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: "mot de passe de l'utillisateurs",
    example: 'CeCiestUnSupeRMOtDePasse123azerty',
  })
  @MinLength(6)
  password: string;
}
