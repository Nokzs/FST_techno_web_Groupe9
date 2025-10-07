import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response } from 'express';
import { UserService } from '../../user/service/user.service';
import { UserAuthService } from '../service/auth.service';
import { RegisterUserDto } from '../DTO/register-user.dto';
import { LoginUserDto } from '../DTO/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: UserAuthService
  ) {}
  @Post('register')
  async register(
    @Body() registerDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Un compte existe deja avec cet e-mail.');
    }

    const user = await this.userService.create(registerDto);
    const userId = this.authService.getUserId(user);
    await this.userService.setLastConnection(userId);

    const token = await this.authService.createAuthToken(user);
    this.authService.attachAuthCookie(res, token);

    return {
      user: this.authService.sanitizeUser(user),
      message: 'Compte cree avec succes.',
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    const isValidPassword = await this.userService.comparePassword(
      loginDto.password,
      user.password
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Identifiants incorrects.');
    }

    const userId = this.authService.getUserId(user);
    await this.userService.setLastConnection(userId);
    const token = await this.authService.createAuthToken(user);
    this.authService.attachAuthCookie(res, token);

    return {
      user: this.authService.sanitizeUser(user),
      message: 'Connexion reussie.',
    };
  }
}
