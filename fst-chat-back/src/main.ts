import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DynamicIoAdapter } from './message/adapter/DynamicIoAdapter';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173'
  );
  const port = configService.get('PORT');
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  // Utilisation de l’adaptateur WebSocket personnalisé
  app.useWebSocketAdapter(new DynamicIoAdapter(app));
  Logger.log('Application lancee sur le port ' + String(port), 'Bootstrap');

  await app.listen(port || 3000);
  console.log(`application lance sur le port ${port}`);
}

void bootstrap();
