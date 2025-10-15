import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'change-this-secret'),
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('JWT_EXPIRES_IN') || '3600',
            10
          ),
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
