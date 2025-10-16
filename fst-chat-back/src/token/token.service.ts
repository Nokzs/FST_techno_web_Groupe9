import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from './types/jwtPayload';
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}
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
  public generateToken(object: object): Promise<string> {
    return this.jwtService.signAsync(object, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.resolveCookieMaxAge(
        this.configService.get<string>('JWT_EXPIRES_IN', '7d')
      ),
    });
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
