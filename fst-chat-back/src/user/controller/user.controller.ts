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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { UserService } from '../service/user.service';
import { RegisterUserDto } from '../DTO/register-user.dto';
import { LoginUserDto } from '../DTO/login-user.dto';
import { User, UserDocument } from '../schema/user.schema';

type PlainUserObject = {
  id?: string;
  _id?: unknown;
  pseudo?: string;
  email?: string;
  language?: string;
  isAdmin?: boolean;
  lastConnectedAt?: Date;
  createdAt?: Date;
  password?: string;
};

@Controller('auth')
export class UserAuthController {
  private readonly authCookieName = 'fst_chat_token';
  private readonly cookieMaxAgeMs: number;
  private readonly isSecureCookie: boolean;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    this.cookieMaxAgeMs = this.resolveCookieMaxAge(
      this.configService.get<string>('JWT_EXPIRES_IN', '1h')
    );
    this.isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

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
    const userId = this.extractUserId(user);
    await this.userService.setLastConnection(userId);

    const token = await this.signToken(user);
    this.attachAuthCookie(res, token);

    return {
      access_token: token,
      user: this.sanitizeUser(user),
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

    const userId = this.extractUserId(user);
    await this.userService.setLastConnection(userId);
    const token = await this.signToken(user);
    this.attachAuthCookie(res, token);

    return {
      access_token: token,
      user: this.sanitizeUser(user),
      message: 'Connexion reussie.',
    };
  }

  private sanitizeUser(user: User | UserDocument) {
    const plain = this.toPlainUser(user);
    const { password: _password, _id, id, ...rest } = plain;
    void _password;

    return {
      id: this.resolveId(id, _id),
      pseudo: rest.pseudo,
      email: rest.email,
      language: rest.language,
      isAdmin: rest.isAdmin ?? false,
      lastConnectedAt: rest.lastConnectedAt,
      createdAt: rest.createdAt,
    };
  }

  private async signToken(user: User | UserDocument): Promise<string> {
    const plain = this.toPlainUser(user);
    const userId = this.resolveId(plain.id, plain._id);

    return this.jwtService.signAsync({
      sub: userId,
      email: plain.email,
      pseudo: plain.pseudo,
      isAdmin: plain.isAdmin ?? false,
    });
  }

  private attachAuthCookie(res: Response, token: string) {
    res.cookie(this.authCookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isSecureCookie,
      maxAge: this.cookieMaxAgeMs,
    });
  }

  private resolveCookieMaxAge(duration: string): number {
    const numericValue = Number(duration);
    if (!Number.isNaN(numericValue)) {
      return numericValue * 1000;
    }

    const match = duration
      .trim()
      .toLowerCase()
      .match(/^(\d+)([smhd])$/);
    if (!match) {
      return 60 * 60 * 1000;
    }

    const value = Number(match[1]);
    const unit = match[2];

    const unitMap: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * (unitMap[unit] ?? unitMap.h);
  }

  private toPlainUser(user: User | UserDocument): PlainUserObject {
    if (typeof (user as UserDocument).toObject === 'function') {
      return (user as UserDocument).toObject() as PlainUserObject;
    }
    const plainUser = user as User;
    return {
      pseudo: plainUser.pseudo,
      email: plainUser.email,
      language: plainUser.language,
      isAdmin: plainUser.isAdmin,
      lastConnectedAt: plainUser.lastConnectedAt,
      createdAt: plainUser.createdAt,
      password: plainUser.password,
      id: (plainUser as { id?: string }).id,
      _id: (plainUser as { _id?: unknown })._id,
    };
  }

  private resolveId(id?: string, rawId?: unknown): string {
    if (id && id.length > 0) {
      return id;
    }
    if (rawId !== undefined && rawId !== null) {
      if (typeof rawId === 'string') {
        return rawId;
      }
      const candidate = rawId as { toString?: () => string };
      if (typeof candidate.toString === 'function') {
        return candidate.toString();
      }
    }
    return '';
  }

  private extractUserId(user: User | UserDocument): string {
    const documentCandidate = user as UserDocument;
    if (
      typeof documentCandidate.id === 'string' &&
      documentCandidate.id.length > 0
    ) {
      return documentCandidate.id;
    }
    return this.resolveId(
      (user as { id?: string }).id,
      (user as { _id?: unknown })._id
    );
  }
}
