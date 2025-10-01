import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  // Activer CORS pour ton front
  app.enableCors({
    origin: 'http://localhost:5173', // ton front React
    credentials: true, // si tu utilises cookies / auth
  });

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get('PORT');

  await app.listen(port || 3000);
  console.log(`application lance sur le port ${port}`);
}
bootstrap();
