import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, MinLength, IsOptional } from 'class-validator';

/**
 * DTO utilisé pour l'inscription d'un nouvel utilisateur.
 * Contient les champs obligatoires `pseudo`, `email` et `password`.
 * Le champ `language` est optionnel et permet de définir la langue préférée de l'utilisateur.
 */
export class RegisterUserDto {
  @ApiProperty({
    description: "Pseudo de l'utilisateur",
    example: 'toto',
  })
  @IsNotEmpty()
  pseudo: string;

  @ApiProperty({
    description: "Adresse email valide de l'utilisateur",
    example: 'toto@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "Mot de passe de l'utilisateur (minimum 6 caractères)",
    example: 'CeCiestUnSupeRMOtDePasse123azerty',
  })
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "Langue préférée de l'utilisateur",
    example: 'fr',
    required: false,
  })
  @IsOptional()
  language?: string;
}
