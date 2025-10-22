import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserAuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { UserModule } from 'src/user/module/user.module';
import { TokenModule } from 'src/token/token.module';
import { GuardModule } from '../../guards/guards.module';
import { StorageModule } from '../../storage/storage.module';
import { provider } from '../../config/constante';
@Module({
  imports: [
    UserModule,
    TokenModule,
    ConfigModule,
    GuardModule,
    StorageModule.register(provider),
  ],
  controllers: [AuthController],
  providers: [UserAuthService],
  exports: [UserAuthService],
})
export class AuthModule {}
