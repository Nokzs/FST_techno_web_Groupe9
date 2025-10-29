import { Module, forwardRef } from '@nestjs/common';
import { TokenModule } from '../token/token.module';
import { AuthGuard } from './authGuard';
import { ServerModule } from '../server/module/server.module';
import { isAdminGuard } from './isAdminGuard';
@Module({
  imports: [TokenModule, forwardRef(() => ServerModule)],
  providers: [AuthGuard, isAdminGuard],
  exports: [AuthGuard, TokenModule],
})
export class GuardModule {}
