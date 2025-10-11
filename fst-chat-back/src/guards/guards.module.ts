import { Module } from '@nestjs/common';
import { TokenModule } from 'src/token/token.module';
import { TokenService } from 'src/token/token.service';
import { AuthGuard } from './authGuard';
@Module({
  imports: [TokenModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class GuardModule {}
