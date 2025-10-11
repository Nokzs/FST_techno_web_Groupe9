import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserService } from '../../user/service/user.service';
import { UserAuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { UserModule } from 'src/user/module/user.module';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';
import { GuardModule } from 'src/guards/guards.module';
import { AuthGuard } from '../../guards/authGuard';
@Module({
  imports: [UserModule, TokenModule, ConfigModule, GuardModule],
  controllers: [AuthController],
  providers: [UserService, UserAuthService, TokenService, AuthGuard],
  exports: [UserAuthService],
})
export class AuthModule {}
