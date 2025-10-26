import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../../guards/authGuard';
import { ChannelDto } from '../DTO/channel.dto';
import { CreateChannelDto } from '../DTO/create-channel.dto';
import { ChannelService } from '../service/channel.service';
import { type IStorageProvider } from '../../storage/provider/IStorageProvider';
@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  async createChannel(@Body() dto: CreateChannelDto): Promise<ChannelDto> {
    const channel = await this.channelService.create(dto);
    Logger.log('id', channel._id);
    this.storage.createRoomBucket(channel._id.toString());
    return plainToInstance(ChannelDto, channel);
  }

  @Get('/:id')
  @UseGuards(AuthGuard)
  async getChannelsByServer(
    @Param('id') serverId: string
  ): Promise<ChannelDto[]> {
    const channels = await this.channelService.getChannelsByServer(serverId);
    return channels.map((channel) => plainToInstance(ChannelDto, channel));
  }
  @Get('channel/:id')
  @UseGuards(AuthGuard)
  async getChannel(@Param('id') channelId: string): Promise<ChannelDto | null> {
    const channel = await this.channelService.getPopulateChannel(channelId);
    return channel ? plainToInstance(ChannelDto, channel) : null;
  }
}
