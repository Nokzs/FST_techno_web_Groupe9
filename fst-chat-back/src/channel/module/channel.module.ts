// src/channels/channel.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelService } from '../service/channel.service';
import { ChannelController } from '../controller/channel.controller';
import { Channel, ChannelSchema } from '../schema/channel.schema';
import { AuthModule } from 'src/auth/module/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    AuthModule,
  ],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService], // si tu veux utiliser le service ailleurs
})
export class ChannelModule {}
