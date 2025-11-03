import { OmitType } from '@nestjs/swagger';
import { IsOptional, MinLength } from 'class-validator';
import { CompleteUserResponseDto } from './UserResponseDto';
import { ApiProperty } from '@nestjs/swagger';
export class UpdateUserDTO extends OmitType(CompleteUserResponseDto, [
  'email',
] as const) {
  @IsOptional()
  @MinLength(6)
  @ApiProperty({
    description: "mot de passe de l'utillisateurs",
  })
  password?: string;
}
