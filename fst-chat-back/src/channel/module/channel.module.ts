// src/channels/channel.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelService } from '../service/channel.service';
import { ChannelController } from '../controller/channel.controller';
import { Channel, ChannelSchema } from '../schema/channel.schema';
import {
  Notification,
  NotificationSchema,
} from '../schema/notification.schema';

import { AuthGuard } from '../../guards/authGuard';
import { TokenModule } from '../../token/token.module';
import { StorageModule } from '../../storage/storage.module';
import { provider } from '../../config/constante';
import { ServerModule } from 'src/server/module/server.module';
import { RolesModule } from 'src/roles/roles.module';
import { RolesGuard } from 'src/roles/roles.guard';
import {
  RoleAssignment,
  RoleAssignmentSchema,
} from 'src/roles/schema/role-assignment.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Channel.name, schema: ChannelSchema },
      { name: Notification.name, schema: NotificationSchema },
      { schema: RoleAssignmentSchema, name: RoleAssignment.name },
    ]),
    TokenModule,
    StorageModule.register(provider),
    forwardRef(() => ServerModule),
    RolesModule,
  ],
  controllers: [ChannelController],
  providers: [ChannelService, AuthGuard, RolesGuard],
  exports: [ChannelService], // si tu veux utiliser le service ailleurs
})
export class ChannelModule {}
