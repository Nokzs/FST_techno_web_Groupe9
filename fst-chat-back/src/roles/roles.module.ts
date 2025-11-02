import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesService } from './roles.service';
import { RoleAssignment, RoleAssignmentSchema } from './schema/role-assignment.schema';
import { RolesController } from './roles.controller';
import { ServerModule } from '../server/module/server.module';
import { TokenModule } from '../token/token.module';
import { AuthGuard } from '../guards/authGuard';
import { ChannelModule } from '../channel/module/channel.module';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RoleAssignment.name, schema: RoleAssignmentSchema }]),
    forwardRef(() => ServerModule),
    forwardRef(() => ChannelModule),
    TokenModule,
  ],
  controllers: [RolesController],
  providers: [RolesService, AuthGuard, RolesGuard],
  exports: [RolesService],
})
export class RolesModule {}
