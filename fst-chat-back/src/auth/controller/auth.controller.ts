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
  Inject,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { UserService } from '../../user/service/user.service';
import { UserAuthService } from '../service/auth.service';
import { RegisterUserDto } from '../DTO/register-user.dto';
import { LoginUserDto } from '../DTO/login-user.dto';
import { TokenService } from '../../token/token.service';
import type { IStorageProvider } from '../../storage/provider/IStorageProvider';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: UserAuthService,
    private readonly tokenService: TokenService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}

  @ApiCreatedResponse({
    description: 'Utilisateur crée avec succés',
  })
  @ApiConflictResponse({
    description: 'Un compte existe deja avec cet e-mail.',
  })
  @ApiOperation({
    summary: 'Crée un nouvel utilisateur',
    description:
      'Cette route permet de créer un utilisateur avec email et mot de passe. Vérifie que l’email n’existe pas déjà.',
    deprecated: false,
  })
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
    const token = await this.tokenService.generateToken({ sub: userId });
    this.authService.attachAuthCookie(res, token);
    this.storage.createBucket(`fstChatProfilPictureBucket${userId}`);
    return {
      user: this.authService.sanitizeUser(user),
      message: 'Compte cree avec succes.',
    };
  }
  @ApiResponse({
    status: 200,
    description: 'Utilisateur connecter avec succés',
  })
  @ApiUnauthorizedResponse({
    description: 'Un compte existe deja avec cet e-mail.',
  })
  @ApiOperation({
    summary: 'Connecte un utilisateur',
    description:
      'Cette route permet de connecter si les identifiants sont correctes',
    deprecated: false,
  })
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
    const token = await this.tokenService.generateToken({ sub: userId });
    this.authService.attachAuthCookie(res, token);

    return {
      user: this.authService.sanitizeUser(user),
      message: 'Connexion reussie.',
    };
  }
  @ApiUnauthorizedResponse({
    description: 'Token manquant',
  })
  @ApiOkResponse()
  @ApiOperation({
    summary: "Récupere l'utlisateur connecté",
  })
  @ApiBearerAuth()
  // l'utilisation de res impose la gestion manuelle des status'
  @Get('user')
  async getUser(@Req() request: Request, @Res() res: Response) {
    const token = request.cookies['fst_chat_token'];
    if (!token) {
      this.authService.clearCookie(res);
      return res.status(401).json({ message: 'Token manquant' });
    }

    const payload = await this.tokenService.verifyToken(token);

    if (!payload) {
      this.authService.clearCookie(res);
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }

    return res.status(200).json(payload);
  }
}
