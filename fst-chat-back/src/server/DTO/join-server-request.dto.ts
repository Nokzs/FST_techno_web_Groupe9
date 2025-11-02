import { IsString } from 'class-validator';

export class JoinServerRequestDto {
  @IsString()
  code: string;
}
