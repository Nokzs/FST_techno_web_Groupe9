import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'change-this-secret'),
        signOptions: {
          expiresIn: (() => {
            const raw = configService.get<string>('JWT_EXPIRES_IN', '1h');
            if (!raw) {
              return '1h';
            }
            const numeric = Number(raw);
            return Number.isNaN(numeric) ? raw : numeric;
          })(),
        },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [TokenService],
  exports: [TokenService, JwtModule],
})
export class TokenModule {}
