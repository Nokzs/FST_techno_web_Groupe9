import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  NotFoundException,
  Param,
  Delete,
} from '@nestjs/common';
import { ServerService } from '../service/server.service';
import { plainToInstance } from 'class-transformer';
import { ServerDto } from '../DTO/server.dto';
import { AuthGuard } from '../../guards/authGuard';
import { CreateServerDto } from '../DTO/create-server.dto';
import { CreateServerRequestDto } from '../DTO/create-server-request-dto';
import { ServerGateway } from '../gateway/server.gateway';
import { UserService } from '../../user/service/user.service';
import { RolesService } from '../../roles/roles.service';
import { CompleteUserResponseDto } from '../../user/DTO/UserResponseDto';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import { RolesGuard } from '../../roles/roles.guard';

@Controller('servers')
export class ServerController {
  constructor(
    private readonly serverService: ServerService,
    private readonly serverGateway: ServerGateway,
    private readonly userService: UserService,
    private readonly rolesService: RolesService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async findUserServers(@Req() request: Request) {
    const userId = request['user'].sub;

    const servers = this.serverService.findByUserId(userId);
    return servers.then((tab) =>
      tab.map((server) => plainToInstance(ServerDto, server))
    );
  }

  @Post()
  @UseGuards(AuthGuard)
  async createServer(
    @Req() request: Request,
    @Body() body: CreateServerRequestDto
  ) {
    const userId = request['user'].sub; // user connectÃ©

    const dto: CreateServerDto = {
      ...body,
      ownerId: userId,
      members: [userId], // Le créateur est automatiquement membre
    };
    const server = await this.serverService.create(dto);
    try {
      const sid = (server as any)?._id?.toString?.() || (server as any)?.id;
      if (sid) await this.rolesService.setUserRole(sid, userId, Role.CREATOR);
    } catch {}
    return plainToInstance(ServerDto, server);
  }

  @Post('join')
  @UseGuards(AuthGuard)
  async joinServer(@Req() request: Request, @Body() body: { code: string }) {
    const userId = request['user'].sub;
    const server = await this.serverService.joinByInviteCode(userId, body.code);
    if (!server) {
      console.log('pas de serveur recup');
      throw new NotFoundException("Code d'invitation invalide");
    }
    try {
      const profile = await this.userService.findById(
        userId as unknown as string
      );
      const srvId = (server as any)._id?.toString?.();
      console.log('[ServerController] joinServer -> emitting member joined', {
        srvId,
      });
      this.serverGateway.emitServerMemberJoined(srvId, profile);
      if (srvId) {
        // Attribue le rôle par défaut configuré sur le serveur (fallback MEMBER)
        const defaultRole =
          ((server as any)?.defaultRole as Role) ?? Role.MEMBER;
        await this.rolesService.setUserRole(
          srvId,
          userId as string,
          defaultRole
        );
      }
    } catch (e) {
      console.error('[ServerController] joinServer emit failed', e);
    }
    return plainToInstance(ServerDto, server);
  }

  @Get(':id/members')
  @UseGuards(AuthGuard)
  async getServerMembers(
    @Param('id') serverId: string
  ): Promise<CompleteUserResponseDto[]> {
    return this.serverService.getMembersByServerId(serverId);
  }

  @Get(':id/me')
  @UseGuards(AuthGuard)
  async getMyRole(@Req() request: Request, @Param('id') serverId: string) {
    const userId = request['user'].sub as string;
    const server = await this.serverService.findById(serverId);
    if (!server) throw new NotFoundException('Server not found');
    // Prefer DB assignment
    try {
      const assigned = await this.rolesService.getUserRole(serverId, userId);
      if (assigned) return { role: assigned };
    } catch {}
    // Fallback to owner heuristic
    const owner =
      (server as any)?.ownerId?.toString?.() || (server as any)?.ownerId;
    return { role: owner === userId ? Role.CREATOR : Role.MEMBER };
  }

  @Post('leave')
  @UseGuards(AuthGuard)
  async leaveServer(
    @Req() request: Request,
    @Body() body: { serverId: string }
  ) {
    const userId = request['user'].sub;
    const server = await this.serverService.leaveServer(body.serverId, userId);
    if (server) {
      this.serverGateway.emitServerMemberLeft(body.serverId, userId);
      return { success: true };
    }
    return { success: false };
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  async deleteServer(@Param('id') serverId: string) {
    const ok = await this.serverService.deleteById(serverId);
    if (ok) {
      try {
        this.serverGateway.emitServerDeleted(serverId);
      } catch {}
    }
    return { success: ok };
  }
}
