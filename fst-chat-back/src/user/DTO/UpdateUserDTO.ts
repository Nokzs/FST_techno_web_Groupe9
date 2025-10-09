import { OmitType } from '@nestjs/swagger';
import { CreateUserDTO } from '../../auth/DTO/CreateUserDTO';
import { IsMongoId } from 'class-validator';
import { Optional } from '@nestjs/common';

export class UpdateUserDTO extends OmitType(CreateUserDTO, ['email'] as const) {
  @IsMongoId()
  id: string;
  @Optional()
  fileName: string;
}
