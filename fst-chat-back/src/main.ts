import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173'
  );
  const port = configService.get<number>('PORT', 3000);

  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });

  await app.listen(port);
  Logger.log('Application lancee sur le port ' + String(port), 'Bootstrap');
}

void bootstrap();
