import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
  Logger,
  ServiceUnavailableException,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../../guards/authGuard';
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
@ApiTags('channels')
@Controller('channels')
export class ChannelController {
  constructor(
    private readonly channelService: ChannelService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
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
  @UseGuards(AuthGuard)
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
    @Param('id') serverId: string
  ): Promise<ChannelDto[]> {
    const channels = await this.channelService.getChannelsByServer(serverId);
    if (!channels) {
      throw new NotFoundException("il n'y a aucun channel pour ce serveur");
    }
    return channels.map((channel) => plainToInstance(ChannelDto, channel));
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
