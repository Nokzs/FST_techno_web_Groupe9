import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ServerService } from '../service/server.service';
import { plainToInstance } from 'class-transformer';
import { ServerDto } from '../DTO/server.dto';
import { AuthGuard } from '../../auth/guards/authGuard';
import { CreateServerDto } from '../DTO/create-server.dto';
import { CreateServerRequestDto } from '../DTO/create-server-request-dto';

@Controller('servers')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  // @Get()
  // findAll() {
  //   const servers = this.serverService.findAll();
  //   return servers.then((tab) =>
  //     tab.map((server) => plainToInstance(ServerDto, server))
  //   );
  // }

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
}
