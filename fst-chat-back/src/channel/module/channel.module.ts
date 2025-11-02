// src/channels/channel.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelService } from '../service/channel.service';
import { ChannelController } from '../controller/channel.controller';
import { Channel, ChannelSchema } from '../schema/channel.schema';
import { AuthGuard } from '../../guards/authGuard';
import { TokenModule } from '../../token/token.module';
import { StorageModule } from '../../storage/storage.module';
import { provider } from '../../config/constante';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    TokenModule,
    StorageModule.register(provider),
  ],
  controllers: [ChannelController],
  providers: [ChannelService, AuthGuard],
  exports: [ChannelService], // si tu veux utiliser le service ailleurs
})
export class ChannelModule {}
