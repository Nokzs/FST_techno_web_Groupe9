import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CompleteUserResponseDto } from '../DTO/UserResponseDto';
import { User } from '../schema/user.schema';
import { plainToClass } from 'class-transformer';
import { UpdateUserDTO } from '../DTO/UpdateUserDTO';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('/profile/:id')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @Param('id') userId: string
  ): Promise<CompleteUserResponseDto> {
    console.log(userId);
    const user: User | null = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('utilisateur non trouvé');
    }
    const userDto = plainToClass(CompleteUserResponseDto, user);
    return userDto;
  }
  /* @Get('/update')
  async updateUser(@Body() body: UpdateUserDTO) {} */
}
