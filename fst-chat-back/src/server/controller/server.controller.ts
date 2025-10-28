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
} from '@nestjs/common';
import { ServerService } from '../service/server.service';
import { plainToInstance } from 'class-transformer';
import { ServerDto } from '../DTO/server.dto';
import { AuthGuard } from '../../guards/authGuard';
import { CreateServerDto } from '../DTO/create-server.dto';
import { CreateServerRequestDto } from '../DTO/create-server-request-dto';

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
  @Post('openJoin')
  @UseGuards(AuthGuard)
  async openJoin(@Req() req: Request): ServerDto {}

  @Put('open')
  @UseGuards(AuthGuard)
  async open(
    @Req() req: Request,
    @Body() body: { serverId: string; tags: string[] }
  ) {
    const userId = request['user'].sub;
    const server = await this.serverService.openServer(
      body.serverId,
      body.tags
    );
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
}
