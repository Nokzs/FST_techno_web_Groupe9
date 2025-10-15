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
  public generateToken(object: object): Promise<string> {
    return this.jwtService.signAsync(object);
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
