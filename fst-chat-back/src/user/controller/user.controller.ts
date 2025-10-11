import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
} from '@nestjs/common';
import { PublicUrlDTO } from 'src/storage/DTO/publicUrl';
import { AuthGuard } from 'src/guards/authGuard';
import { UserService } from '../service/user.service';
import { CompleteUserResponseDto } from '../DTO/UserResponseDto';
import { User } from '../schema/user.schema';
import { plainToInstance } from 'class-transformer';
import type { IStorageProvider } from 'src/storage/provider/IStorageProvider';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly storage: IStorageProvider
  ) {}
  @Get('/profile/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getProfile(
    @Param('id') userId: string
  ): Promise<CompleteUserResponseDto> {
    console.log(userId);
    const user: User | null = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('utilisateur non trouvé');
    }
    const userDto = plainToInstance(CompleteUserResponseDto, user);
    return userDto;
  }

  @UseGuards(AuthGuard)
  @Get('/publicUrl/:filename')
  getPublicUrl(@Param(':filename') filename: string): PublicUrlDTO {
    const publicUrl = this.storage.getPublicUrl(
      'fstChatProfilPictureBucket',
      filename
    );
    return plainToInstance(PublicUrlDTO, { publicUrl });
  }
  /* @Get('/update')
  async updateUser(@Body() body: UpdateUserDTO) {} */
}
