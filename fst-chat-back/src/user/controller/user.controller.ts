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
} from '@nestjs/common';
import { PublicUrlDTO } from '../../storage/DTO/publicUrl';
import { AuthGuard } from '../../guards/authGuard';
import { UserService } from '../service/user.service';
import { CompleteUserResponseDto } from '../DTO/UserResponseDto';
import { User } from '../schema/user.schema';
import { plainToInstance } from 'class-transformer';
import type { IStorageProvider } from 'src/storage/provider/IStorageProvider';

import { UpdateUserDTO } from '../DTO/UpdateUserDTO';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
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
  @Get(':id/profilPictureUrl')
  async getPublicProfilePicture(@Param('id') id: string):Promise<PublicUrlDTO> {
    const user = this.userService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    const url = this.storage.getPublicUrl(
      `${id}/profilePicture`,
      'profilPicture'
    );
    return plainToInstance(PublicUrlDTO,url)
  }
  @UseGuards(AuthGuard)
  @Put(':id/update')
  async updateUser(@Body() body: UpdateUserDTO){
    const user = this.userService.findById(body.id);
    if(!user){
      throw new NotFoundException();
    }
    this.userService.updateUser(body);
  }
}
