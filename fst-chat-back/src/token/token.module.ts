import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

function toSeconds(v?: string, fallback = 604800): number {
  if (!v) return fallback;
  const n = Number(v);
  if (!Number.isNaN(n)) return n;
  const m = v.trim().toLowerCase().match(/^(\d+)([smhd])$/);
  if (!m) return fallback;
  const value = Number(m[1]);
  const unit = m[2];
  const map: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * (map[unit] ?? 86400);
}

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): JwtModuleOptions => {
        const secret = configService.get<string>('JWT_SECRET', 'change-this-secret');
        const raw = configService.get<string>('JWT_EXPIRES_IN') ?? '7d';
        const expiresIn = toSeconds(raw, 604800);
        return {
          secret,
          signOptions: { expiresIn },
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [TokenService],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}
