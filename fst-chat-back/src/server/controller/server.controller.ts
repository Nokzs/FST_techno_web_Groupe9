import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  NotFoundException,
  Param,
  Logger,
  Put,
  Query,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { ServerService } from '../service/server.service';
import { plainToInstance } from 'class-transformer';
import { ServerDto } from '../DTO/server.dto';
import { AuthGuard } from '../../guards/authGuard';
import { CreateServerDto } from '../DTO/create-server.dto';
import { CreateServerRequestDto } from '../DTO/create-server-request-dto';
import { isAdminGuard } from 'src/guards/isAdminGuard';
import type { Request } from 'express';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ServerGateway } from '../gateway/server.gateway';
import { UserService } from '../../user/service/user.service';
import { RolesService } from '../../roles/roles.service';
import { CompleteUserResponseDto } from '../../user/DTO/UserResponseDto';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import { RolesGuard } from '../../roles/roles.guard';

@ApiTags('Servers')
@Controller('servers')
export class ServerController {
  constructor(
    private readonly serverService: ServerService,
    private readonly serverGateway: ServerGateway,
    private readonly userService: UserService,
    private readonly rolesService: RolesService
  ) {}

  @ApiOperation({ summary: "Récupère les serveurs de l'utilisateur connecté" })
  @ApiOkResponse({
    description: "Liste des serveurs de l'utilisateur",
    type: ServerDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié',
  })
  @ApiBearerAuth()
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
  @ApiOperation({ summary: 'Crée un nouveau serveur' })
  @ApiOkResponse({
    description: 'Le serveur a été créé avec succès',
    type: ServerDto,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erreur lors de la création du serveur',
  })
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
    if (!server) {
      throw new InternalServerErrorException(
        'Erreur lors de la création du serveur'
      );
    }
    return plainToInstance(ServerDto, server);
  }
  @ApiOperation({ summary: "Rejoindre un serveur via un code d'invitation" })
  @ApiOkResponse({
    description: 'Le serveur a été rejoint avec succès',
    type: ServerDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié',
  })
  @ApiBearerAuth()
  @ApiNotFoundResponse({
    description: "Code d'invitation invalide",
  })
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

  @ApiOperation({ summary: 'Rejoindre un serveur ouvert' })
  @ApiOkResponse({
    description: 'Le serveur ouvert a été rejoint avec succès',
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié',
  })
  @ApiBearerAuth()
  @Post('/openJoin')
  @UseGuards(AuthGuard)
  async openJoinServer(
    @Body() body: { serverId: string },
    @Req() request: Request
  ): Promise<void> {
    const serverId = body.serverId;
    const userId = request['user'].sub;
    const server = await this.serverService.joinOpen(serverId, userId);
    if (!server) {
      console.log('pas de serveur recup');
      throw new NotFoundException("Code d'invitation invalide");
    }
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
    return;
  }

  @ApiOperation({ summary: 'Ouvrir un serveur (le rendre public)' })
  @ApiOkResponse({
    description: 'Le serveur a été ouvert avec succès',
    type: ServerDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié ou non administrateur',
  })
  @ApiNotFoundResponse({})
  @ApiBearerAuth()
  @Put('open')
  @UseGuards(AuthGuard, isAdminGuard)
  async open(
    @Req() request: Request,
    @Body() body: { serverId: string; tags: string[] }
  ): Promise<ServerDto> {
    const userId = request['user'].sub;
    const server = await this.serverService.openServer(
      body.serverId,
      body.tags,
      userId
    );
    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }
    return plainToInstance(ServerDto, server);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fermer un serveur (le rendre privé)' })
  @ApiOkResponse({
    description: 'Le serveur a été fermé avec succès',
    type: ServerDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Utilisateur non authentifié ou non administrateur',
  })
  @ApiInternalServerErrorResponse({
    description: 'Erreur lors de la fermeture du serveur',
  })
  @Put('close')
  @UseGuards(AuthGuard, isAdminGuard)
  async close(
    @Req() request: Request,
    @Body() body: { serverId: string; tags: string[] }
  ): Promise<ServerDto> {
    const userId = request['user'].sub;
    const server = await this.serverService.closeServer(body.serverId, userId);
    if (!server) {
      throw new NotFoundException('Serveur introuvable');
    }
    return plainToInstance(ServerDto, server);
  }

  @Get('/channel/:channelId')
  @UseGuards(AuthGuard)
  async getServersFromChannel(
    @Param('channelId') channelId: string
  ): Promise<ServerDto | null> {
    const server = await this.serverService.getFromChannelId(channelId);
    const dto = plainToInstance(ServerDto, server);
    return dto;
  }

  @ApiOperation({
    summary: 'Recherche des serveurs par nom et tags avec pagination',
  })
  @ApiOkResponse({
    description: 'Liste des serveurs correspondant aux critères de recherche',
    type: ServerDto,
    isArray: true,
  })
  @Get('/find')
  @UseGuards(AuthGuard)
  async findServersByNameTags(
    @Req() request: Request,
    @Query('last_id') lastId?: string,
    @Query('SearchName') searchName?: string,
    @Query('SearchTag') searchTags?: string
  ): Promise<ServerDto[]> {
    const userId: string = request['user'].sub as string;
    const servers = await this.serverService.searchServersWithCursor(
      searchName ?? '',
      searchTags ?? '',
      userId,
      20,
      lastId ?? ''
    );
    Logger.log('Servers trouvés:', servers);
    return servers.map((s) => plainToInstance(ServerDto, s));
  }
}
