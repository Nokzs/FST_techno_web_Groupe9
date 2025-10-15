import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../../auth/guards/authGuard';
import { ChannelDto } from '../DTO/channel.dto';
import { CreateChannelDto } from '../DTO/create-channel.dto';
import { ChannelService } from '../service/channel.service';

@Controller('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Post()
  @UseGuards(AuthGuard)
  async createChannel(@Body() dto: CreateChannelDto) {
    const channel = await this.channelService.create(dto);
    return plainToInstance(ChannelDto, channel);
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getChannelsByServer(@Param('id') serverId: string) {
    const channels = await this.channelService.getChannelsByServer(serverId);
    return channels.map((channel) => plainToInstance(ChannelDto, channel));
  }
}
