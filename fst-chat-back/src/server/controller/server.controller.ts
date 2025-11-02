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

@ApiTags('Servers')
@Controller('servers')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

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
    const userId = request['user'].sub; // user connecté

    const dto: CreateServerDto = {
      ...body,
      ownerId: userId,
      members: [userId], // Le créateur est automatiquement membre
    };
    const server = await this.serverService.create(dto);
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
      throw new NotFoundException("Code d'invitation invalide");
    }
    return plainToInstance(ServerDto, server);
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
    await this.serverService.joinOpen(serverId, userId);
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
