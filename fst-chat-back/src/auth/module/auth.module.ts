import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../../user/service/user.service';
import { UserAuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { UserModule } from 'src/user/module/user.module';


@Module({
  imports: [
    
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'change-this-secret'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
        },
      }),
      inject: [ConfigService],
    }), UserModule
  ],
  controllers: [AuthController],
  providers: [UserService, UserAuthService],
  exports: [UserService, UserAuthService],
})
export class AuthModule {}
