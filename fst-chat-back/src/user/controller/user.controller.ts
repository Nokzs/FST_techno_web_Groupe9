import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  UseGuards,
  Inject,
  Put,
  Req,
  Logger,
} from '@nestjs/common';
import { PublicUrlDTO } from '../../storage/DTO/publicUrl';
import { AuthGuard } from '../../guards/authGuard';
import { UserService } from '../service/user.service';
import { CompleteUserResponseDto } from '../DTO/UserResponseDto';
import { User } from '../schema/user.schema';
import { plainToInstance } from 'class-transformer';
import type { IStorageProvider } from 'src/storage/provider/IStorageProvider';
<<<<<<< HEAD
import type { Request } from 'express';
=======

>>>>>>> main
import { UpdateUserDTO } from '../DTO/UpdateUserDTO';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}
  /**
   * @description retourne le profil de l'utilisateur
   *
   *
   */

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
  @Get('/profilPictureUrl')
  async getPublicProfilePicture(@Req() req: Request): Promise<PublicUrlDTO> {
    const id = req['user'].sub as string;
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    const url = this.storage.getPublicUrl(
      `${id}/profilPicture`,
      'profilePicture'
    );
    return plainToInstance(PublicUrlDTO, { publicUrl: url });
  }
  @UseGuards(AuthGuard)
  @Put('update')
  async updateUser(@Body() body: UpdateUserDTO, @Req() req: Request) {
    Logger.log('update requested');
    console.log(body);
    const id = req['user'].sub as string;
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    await this.userService.updateUser(id, body);
  }
}
