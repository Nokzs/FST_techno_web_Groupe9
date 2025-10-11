import { Controller, Get } from '@nestjs/common';
import { ServerService } from '../service/server.service';
import { plainToInstance } from 'class-transformer';
import { ServerDto } from '../DTO/server.dto';

@Controller('servers')
export class ServerController {
    constructor(private readonly serverService: ServerService) {}

    @Get()
    findAll() {
          const servers = this.serverService.findAll();
         return servers.then((tab) =>
      tab.map((server) => plainToInstance(ServerDto, server)),
    );
    }
}
