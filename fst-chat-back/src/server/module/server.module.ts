import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ServerController } from '../controller/server.controller';
import { ServerService } from '../service/server.service';
import { Server, ServerSchema } from '../schema/server.schema';
import { TokenModule } from '../../token/token.module';
import { AuthGuard } from '../../guards/authGuard';
import { ServerGateway } from '../gateway/server.gateway';
import { UserModule } from '../../user/module/user.module';
import { ChannelModule } from '../../channel/module/channel.module';
import { RolesGuard } from '../../roles/roles.guard';
import { RolesModule } from '../../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Server.name, schema: ServerSchema }]),
    TokenModule,
    UserModule,
    forwardRef(() => ChannelModule),
    RolesModule,
  ],
  controllers: [ServerController],
  providers: [ServerService, AuthGuard, ServerGateway, RolesGuard],
  exports: [ServerService, ServerGateway],
})
export class ServerModule {}
