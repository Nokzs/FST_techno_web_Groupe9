import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  Logger,
  Delete,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../../guards/authGuard';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import { RolesGuard } from '../../roles/roles.guard';
import { ChannelDto } from '../DTO/channel.dto';
import { CreateChannelDto } from '../DTO/create-channel.dto';
import { ChannelService } from '../service/channel.service';
import { type IStorageProvider } from 'src/storage/provider/IStorageProvider';
import { ServerGateway } from '../../server/gateway/server.gateway';
@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider,
    private readonly serverGateway: ServerGateway
  ) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
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

  @Get('/detail/:channelId')
  @UseGuards(AuthGuard)
  async getChannelDetail(
    @Param('channelId') channelId: string
  ): Promise<ChannelDto | null> {
    const chan = await this.channelService.getById(channelId);
    if (!chan) return null;
    return plainToInstance(ChannelDto, chan);
  }

  @Delete('/:channelId')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  async deleteChannel(@Param('channelId') channelId: string) {
    const chan = await this.channelService.getById(channelId);
    if (!chan) return { success: false };
    await this.channelService.deleteById(channelId);
    try {
      const sid =
        (chan as any)?.serverId?.toString?.() || (chan as any)?.serverId;
      if (sid) this.serverGateway.emitChannelDeleted(sid, channelId);
    } catch {}
    // Optionally: cleanup storage bucket
    // TODO: cleanup storage if needed (method not available in provider yet)
    return { success: true };
  }
}
