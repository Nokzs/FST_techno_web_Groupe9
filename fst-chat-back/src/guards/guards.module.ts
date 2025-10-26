import { Module } from '@nestjs/common';
import { TokenModule } from '../token/token.module';
import { AuthGuard } from './authGuard';
@Module({
  imports: [TokenModule],
  providers: [AuthGuard],
  exports: [AuthGuard, TokenModule],
})
export class GuardModule {}
