import { Module } from '@nestjs/common';
import { TokenModule } from 'src/token/token.module';
import { AuthGuard } from './authGuard';
@Module({
  imports: [TokenModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class GuardModule {}
