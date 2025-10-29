import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerController } from '../controller/server.controller';
import { ServerService } from '../service/server.service';
import { Server, ServerSchema } from '../schema/server.schema';
import { TokenModule } from '../../token/token.module';
import { AuthGuard } from '../../guards/authGuard';
import { GuardModule } from '../../guards/guards.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    TokenModule,
    forwardRef(() => GuardModule),
  ],
  controllers: [ServerController],
  providers: [ServerService, AuthGuard],
  exports: [ServerService],
})
export class ServerModule {}
