import { OmitType } from '@nestjs/swagger';
import { CreateUserDTO } from './CreateUserDTO';
import { IsMongoId } from 'class-validator';

export class UpdateUserDTO extends OmitType(CreateUserDTO, ['email'] as const) {
  @IsMongoId()
  id: string;
}
