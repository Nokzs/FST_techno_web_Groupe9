import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { User, UserDocument } from '../../user/schema/user.schema';
import type { JwtPayload } from '../types/jwtPayload';
type PlainUser = {
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

export type SanitizedUser = {
  id: string;
  pseudo?: string;
  email?: string;
  language?: string;
  isAdmin: boolean;
  lastConnectedAt?: Date;
  createdAt?: Date;
};
@Injectable()
export class UserAuthService {
  private readonly authCookieName = 'fst_chat_token';
  private readonly cookieMaxAgeMs: number;
  private readonly isSecureCookie: boolean;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    const expires =
      this.configService.get<string>('JWT_EXPIRES_IN', '1h') ?? '1h';
    this.cookieMaxAgeMs = this.resolveCookieMaxAge(expires);
    this.isSecureCookie =
      this.configService.get<string>('NODE_ENV') === 'production';
  }
  sanitizeUser(user: User | UserDocument): SanitizedUser {
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
  async createAuthToken(user: User | UserDocument): Promise<string> {
    return this.jwtService.signAsync({ sub: this.getUserId(user) });
  }

  attachAuthCookie(res: Response, token: string): void {
    res.cookie(this.authCookieName, token, {
      httpOnly: true,
      sameSite: 'none',
      secure: this.isSecureCookie,
      maxAge: this.cookieMaxAgeMs,
    });
  }

  getUserId(user: User | UserDocument): string {
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
  private toPlainUser(user: User | UserDocument): PlainUser {
    if (typeof (user as UserDocument).toObject === 'function') {
      return (user as UserDocument).toObject() as PlainUser;
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
  public async verifyToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('JWT verification failed:', err.message);
      }
      return null;
    }
  }
}
