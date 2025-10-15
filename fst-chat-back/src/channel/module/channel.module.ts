// src/channels/channel.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelService } from '../service/channel.service';
import { ChannelController } from '../controller/channel.controller';
import { Channel, ChannelSchema } from '../schema/channel.schema';
import {AuthGuard} from '../../guards/authGuard'
import { TokenModule } from 'src/token/token.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    TokenModule
  ],
  controllers: [ChannelController],
  providers: [ChannelService,AuthGuard],
  exports: [ChannelService], // si tu veux utiliser le service ailleurs
})
export class ChannelModule {}
