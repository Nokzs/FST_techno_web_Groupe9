import { CanActivate, ExecutionContext, Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { Role } from './role.enum';
import { ServerService } from '../server/service/server.service';
import { ChannelService } from '../channel/service/channel.service';
import { RolesService } from './roles.service';

const roleWeight: Record<Role, number> = {
  [Role.READER]: 1,
  [Role.MEMBER]: 2,
  [Role.ADMIN]: 3,
  [Role.CREATOR]: 4,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly serverService: ServerService,
    private readonly channelService: ChannelService,
    private readonly rolesService: RolesService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    // recupere l id du user via la requete http posé par le authguard
    const userId: string | undefined = request?.user?.sub ?? request?.['user']?.sub;
    if (!userId) throw new ForbiddenException('Unauthorized');

    const serverId = await this.resolveServerId(request);
    if (!serverId) throw new NotFoundException('Server not found');

    const server = await this.serverService.findById(serverId);
    if (!server) throw new NotFoundException('Server not found');

    // Compute effective role: prefer DB assignment; fallback to owner/CREATOR or MEMBER
    let userRole: Role | null = null;
    try {
      userRole = await this.rolesService.getUserRole(serverId, userId);
    } catch {}
    if (!userRole) {
      userRole = this.getEffectiveRole(server, userId);
    }
    const ok = required.some((r) => roleWeight[userRole] >= roleWeight[r]);
    if (!ok) throw new ForbiddenException('Insufficient role');
    return true;
  }

  // cherche le serverId parmis les routes possibles
  private async resolveServerId(request: any): Promise<string | undefined> {
    const params = request?.params ?? {};
    if (params.serverId) return params.serverId;
    if (params.id && (request.baseUrl?.includes('/servers') || request.route?.path?.includes(':id'))) {
      return params.id;
    }
    const channelId = params.channelId || params.id;
    if (channelId && !(request.baseUrl?.includes('/servers'))) {
      try {
        const ch = await this.channelService.getById(channelId);
        const sid = (ch as any)?.serverId?.toString?.() || (ch as any)?.serverId;
        return sid;
      } catch {
        return undefined;
      }
    }
    if (request.body?.serverId) return request.body.serverId;
    return undefined;
  }

  private getEffectiveRole(server: any, userId: string): Role {
    // au cas ou : ownerId => CREATOR, others => MEMBER
    const owner = (server as any)?.ownerId?.toString?.() || (server as any)?.ownerId;
    if (owner && owner === userId) return Role.CREATOR;
    return Role.MEMBER;
  }
}
