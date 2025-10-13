import { OmitType } from '@nestjs/swagger';
import { IsOptional, MinLength } from 'class-validator';
import { CompleteUserResponseDto } from './UserResponseDto';

export class UpdateUserDTO extends OmitType(CompleteUserResponseDto,['email'] as const) {
  @IsOptional()
  @MinLength(6)
  password?: string;
}
