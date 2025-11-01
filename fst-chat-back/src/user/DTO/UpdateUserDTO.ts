import { OmitType } from '@nestjs/swagger';
import { IsMongoId, MinLength } from 'class-validator';
import { Optional } from '@nestjs/common';
import { CompleteUserResponseDto } from './UserResponseDto';

export class UpdateUserDTO extends OmitType(CompleteUserResponseDto, [
  'email',
] as const) {
  @IsMongoId()
  id: string;

  @MinLength(6)
  @Optional()
  password?: string;
}
