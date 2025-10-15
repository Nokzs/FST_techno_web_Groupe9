import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../service/user.service';
import { UserAuthService } from '../../auth/service/auth.service';
import { UserController } from '../controller/user.controller';
import { User, UserSchema } from '../schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'change-this-secret'),
        signOptions: {
          expiresIn: parseInt(
            configService.get<string>('JWT_EXPIRATION_TIME') || '3600',
            10
          ),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserAuthService],
  exports: [MongooseModule, UserService, UserAuthService],
})
export class UserModule {}
