import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '../guards/authGuard';
import { Roles } from './roles.decorator';
import { Role } from './role.enum';
import { RolesGuard } from './roles.guard';
import { ServerService } from '../server/service/server.service';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly serverService: ServerService
  ) {}

  @Get('server/:serverId')
  @UseGuards(AuthGuard)
  async getServerRoles(@Param('serverId') serverId: string) {
    return this.rolesService.getServerRoles(serverId);
  }

  @Patch('server/:serverId/members/:userId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.CREATOR)
  async setRole(
    @Param('serverId') serverId: string,
    @Param('userId') userId: string,
    @Body() body: UpdateRoleDto
  ) {
    const server = await this.serverService.findById(serverId);
    if (!server) throw new ForbiddenException('Server not found');
    const owner =
      (server as any)?.ownerId?.toString?.() || (server as any)?.ownerId;
    // Interdire de toucher au creator
    if (owner && owner === userId)
      throw new ForbiddenException('Cannot change creator role');
    await this.rolesService.setUserRole(serverId, userId, body.role);
    return { success: true };
  }
}
