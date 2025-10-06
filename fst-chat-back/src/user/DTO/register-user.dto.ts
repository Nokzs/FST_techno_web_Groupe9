import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';

const SUPPORTED_LANGUAGES = ['fr', 'us', 'de'];

export class RegisterUserDto {
  @IsNotEmpty()
  pseudo: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsIn(SUPPORTED_LANGUAGES, {
    message: 'Langue non supportee. Valeurs attendues: fr, us, de',
  })
  language?: string;
}
