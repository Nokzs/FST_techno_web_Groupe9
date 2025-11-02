import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DynamicIoAdapter } from './message/adapter/DynamicIoAdapter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('FST-Chat Api')
    .setDescription("Api de l'application FST-Chat")
    .setVersion('1.0')
    .addTag('auth', "Operation de connexion et d'inscription")
    .addTag('channels', 'routes associées aux salon')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());

  const configService = app.get(ConfigService);
  const frontendUrl = configService.get<string>(
    'FRONTEND_URL',
    'http://localhost:5173'
  );
  const port = configService.get('PORT') || 3000;
  app.enableCors({
    origin: frontendUrl,
    credentials: true,
  });
  // Utilisation de l’adaptateur WebSocket personnalisé
  app.useWebSocketAdapter(new DynamicIoAdapter(app));
  Logger.log('Application lancee sur le port ' + String(port), 'Bootstrap');

  await app.listen(port);
  console.log(`application lance sur le port ${port}`);
}

void bootstrap();
