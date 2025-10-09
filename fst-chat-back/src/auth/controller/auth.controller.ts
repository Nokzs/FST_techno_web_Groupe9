import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
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
    console.log('je passe dans le controller');
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
  // l'utilisation de res impose la gestion manuelle des status'
  @Get('user')
  async getUser(@Req() request: Request, @Res() res: Response) {
    const token = request.cookies['fst_chat_token'];

    if (!token) {
      this.authService.clearCookie(res);
      return res.status(401).json({ message: 'Token manquant' });
    }

    const payload = await this.authService.verifyToken(token);

    if (!payload) {
      this.authService.clearCookie(res);
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }

    return res.status(200).json(payload);
  }
}
