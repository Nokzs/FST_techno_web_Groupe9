import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  Query,
  Logger,
  ServiceUnavailableException,
  NotFoundException,
  Delete,
  Req,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../../guards/authGuard';
import { Roles } from '../../roles/roles.decorator';
import { Role } from '../../roles/role.enum';
import { RolesGuard } from '../../roles/roles.guard';
import { ChannelDto } from '../DTO/channel.dto';
import { CreateChannelDto } from '../DTO/create-channel.dto';
import { ChannelService } from '../service/channel.service';
import { type IStorageProvider } from '../../storage/provider/IStorageProvider';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ServerGateway } from '../../server/gateway/server.gateway';

@ApiTags('channels')
@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider,
    private readonly serverGateway: ServerGateway
  ) {}

  @ApiUnauthorizedResponse({
    description: 'impossible de créer stockage lié au salon',
  })
  @ApiOkResponse({
    type: ChannelDto,
  })
  @ApiOperation({
    summary: "Route de création d'un salon",
  })
  @ApiBearerAuth()
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  async createChannel(@Body() dto: CreateChannelDto): Promise<ChannelDto> {
    const channel = await this.channelService.create(dto);
    try {
      await this.storage.createRoomBucket(channel._id.toString());
    } catch (e) {
      throw new ServiceUnavailableException(
        'impossible de créer le stockage lié au salon'
      );
    }
    return plainToInstance(ChannelDto, channel);
  }

  @ApiNotFoundResponse({
    description: "il n'y a aucun channel pour ce serveur",
  })
  @ApiOkResponse({
    type: ChannelDto,
    isArray: true,
  })
  @ApiOperation({
    summary: "Route de récupération des channels d'un serveur",
  })
  @ApiBearerAuth()
  @Get('/:id')
  @UseGuards(AuthGuard)
  async getChannelsByServer(
    @Param('id') serverId: string,
    @Req() req: Request
  ): Promise<ChannelDto[]> {
    const id = req['user'].sub;
    const channels = await this.channelService.getChannelsWithNotifications(
      id,
      serverId
    );
    if (!channels) {
      throw new NotFoundException("il n'y a aucun channel pour ce serveur");
    }

    const channelsDto = channels.map((channel) =>
      plainToInstance(ChannelDto, channel)
    );

    return channelsDto;
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

  @ApiNotFoundResponse({
    description: "il n'y a aucun channel pour ce serveur",
  })
  @ApiOkResponse({
    type: ChannelDto,
  })
  @ApiOperation({
    summary: "Route de récupération d'un channel par son id",
  })
  @ApiBearerAuth()
  @Get('channel/:id')
  @UseGuards(AuthGuard)
  async getChannel(@Param('id') channelId: string): Promise<ChannelDto | null> {
    const channel = await this.channelService.getPopulateChannel(channelId);
    if (!channel) {
      throw new NotFoundException('aucun salon trouvé avec cette id');
    }
    return plainToInstance(ChannelDto, channel);
  }
}
