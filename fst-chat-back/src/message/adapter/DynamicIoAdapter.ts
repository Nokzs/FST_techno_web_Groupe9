// src/adapters/dynamic-io.adapter.ts
import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerOptions } from 'socket.io';

export class DynamicIoAdapter extends IoAdapter {
  private readonly logger = new Logger(DynamicIoAdapter.name);
  private configService: ConfigService;

  constructor(app: INestApplication) {
    super(app);
    // On récupère ConfigService depuis le conteneur Nest
    this.configService = app.get(ConfigService);
  }

  createIOServer(port: number, options?: ServerOptions) {
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';

    const corsOptions = {
      origin: frontendUrl,
      credentials: true,
    };

    this.logger.log(`CORS WebSocket activé pour : ${frontendUrl}`);

    const finalOptions: ServerOptions = {
      ...options,
      cors: corsOptions,
    } as ServerOptions;

    return super.createIOServer(port, finalOptions);
  }
}
