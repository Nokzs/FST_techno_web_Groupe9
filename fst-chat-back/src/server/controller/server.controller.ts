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
} from '@nestjs/common';
import { ServerService } from '../service/server.service';
import { plainToInstance } from 'class-transformer';
import { ServerDto } from '../DTO/server.dto';
import { AuthGuard } from '../../guards/authGuard';
import { CreateServerDto } from '../DTO/create-server.dto';
import { CreateServerRequestDto } from '../DTO/create-server-request-dto';
import { isAdminGuard } from 'src/guards/isAdminGuard';
import type { Request } from 'express';

@Controller('servers')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

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
    const userId = request['user'].sub; // user connecté

    const dto: CreateServerDto = {
      ...body,
      ownerId: userId,
      members: [userId], // Le créateur est automatiquement membre
    };
    const server = await this.serverService.create(dto);
    return plainToInstance(ServerDto, server);
  }

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
