import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class CreateServerRequestDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Code numérique d'invitation pour rejoindre le serveur
  @IsNumberString()
  inviteCode: string;
}
