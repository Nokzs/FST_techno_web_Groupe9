import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
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
import type { IStorageProvider } from '../../storage/provider/IStorageProvider';
import type { Request } from 'express';
import { UpdateUserDTO } from '../DTO/UpdateUserDTO';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}
  @ApiOperation({
    description:"retourne le profil de l'utilisteur"
    
  })
  @ApiOkResponse({
    type: CompleteUserResponseDto
  })
  @ApiUnauthorizedResponse({
    description:"utilisteur non connecté"
  })
  @Get('/profile/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async getProfile(@Req() request: Request): Promise<CompleteUserResponseDto> {
    const userId = request['user'].sub;
    const user: User | null = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('utilisateur non trouvé');
    }
    const userDto = plainToInstance(CompleteUserResponseDto, user);
    return userDto;
  }

  @ApiResponse({
    description:"Récupere l'url de l'image de profil de l'utilisteur"
  })
  @UseGuards(AuthGuard)
  @Get('/profilPictureUrl')
  async getPublicProfilePicture(@Req() req: Request): Promise<PublicUrlDTO> {
    const id = req['user'].sub as string;
    Logger.log('');
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    const url = this.storage.getPublicUrl(
      `/${id}/profilePicture`,
      'profilePicture',
      id
    );
    return plainToInstance(PublicUrlDTO, { publicUrl: url });
  }
  @ApiOperation({
    description:"met à jour l'utilisateur"
  })
  @ApiOkResponse({})
  @ApiNotFoundResponse({
     description:"utilisateur non connecté"
  })
  @UseGuards(AuthGuard)
  @Put('update')
  async updateUser(@Body() body: UpdateUserDTO, @Req() req: Request) {
    console.log(body);
    const id = req['user'].sub as string;
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException();
    }
    await this.userService.updateUser(id, body);
  }
}
