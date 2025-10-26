import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/module/user.module';
import { AuthModule } from './auth/module/auth.module';
import { MessageModule } from './message/module/message.module';
import { StorageModule } from './storage/storage.module';
import { provider } from './config/constante';
import { ServerModule } from './server/module/server.module';
import { ChannelModule } from './channel/module/channel.module';
import { CustomCacheModule } from './cache/module/Cache.module';
import { GuardModule } from './guards/guards.module';
import { TokenModule } from './token/token.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DB_URL'),
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    GuardModule,
    TokenModule,
    MessageModule,
    StorageModule.register(provider),
    ServerModule,
    ChannelModule,
    CustomCacheModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
