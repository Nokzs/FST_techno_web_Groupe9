import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Inject,
  UseGuards,
  Req,
  InternalServerErrorException,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { CreateMessageDto } from '../DTO/create-message.dto';
import type { IStorageProvider } from '../../storage/provider/IStorageProvider';
import { PublicUrlDTO } from '../../storage/DTO/publicUrl';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from '../../guards/authGuard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Message } from '../schema/message.schema';
import { MessageDto } from '../DTO/message.dto';
@ApiTags('messages')
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    @Inject('STORAGE_PROVIDER') private readonly storage: IStorageProvider
  ) {}

  @ApiOperation({
    description: "route de création d'un message",
  })
  @ApiOkResponse({
    type: Message,
  })
  @ApiInternalServerErrorResponse({
    description: 'Erreur dans la création du message',
  })
  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async create(@Body() createMessageDto: CreateMessageDto): Promise<Message> {
    const message = await this.messageService.create(createMessageDto);
    if (!message) {
      throw new InternalServerErrorException(
        'Erreur lors de la création du message'
      );
    }
    return message;
  }

  @ApiOkResponse({
    type: MessageDto,
    isArray: true,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'utilisateur non connecté',
  })
  @ApiNotFoundResponse({
    description: "Ce channel n'existe pas",
  })
  @UseGuards(AuthGuard)
  @Get()
  async findByChannelAndDate(
    @Query('channelId') channelId: string,
    @Query('date') date: string
  ) {
    Logger.log(
      `Récupération des messages du channel ${channelId} avant la date ${date}`
    );
    const { messages, hasMore } = await this.messageService.findByChannel(
      channelId,
      date
    );
    const dtos = messages.map((msg) => {
      return plainToInstance(MessageDto, msg);
    });
    return {
      messages: dtos,
      hasMore,
    };
  }

  @ApiOperation({
    description:
      'route pour synchroniser les messages d un channel depuis la dernière synchro en cas de déconnexion',
  })
  @ApiOkResponse({
    type: Message,
    isArray: true,
  })
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({
    description: 'utilisateur non connecté',
  })
  @ApiNotFoundResponse({
    description: "Ce channel n'existe pas",
  })
  @ApiBadRequestResponse({
    description: 'Paramètres de requête invalides',
  })
  @Get('/sync')
  @UseGuards(AuthGuard)
  async synchMessages(
    @Query('channelId') channelId: string,
    @Query('lastSync') lastSync: string,
    @Query('lastMessage') lastMessage: string
  ): Promise<Message[]> {
    return await this.messageService.syncMessage(
      channelId,
      lastSync,
      lastMessage
    );
  }
  @ApiOperation({
    description:
      "route pour obtenir l'url publique d'un fichier attaché aux messages",
  })
  @ApiOkResponse({
    type: PublicUrlDTO,
  })
  @ApiServiceUnavailableResponse({
    description: "Erreur lors de la récupération de l'url publique",
  })
  @ApiBearerAuth()
  @Get('filePublicUrl')
  @UseGuards(AuthGuard)
  getPublicUrl(
    @Query('fileName') fileName: string,
    @Query('channelId') channelId: string
  ): PublicUrlDTO {
    try {
      const url = this.storage.getPublicUrl(fileName, 'messageFile', channelId);
      return plainToInstance(PublicUrlDTO, { publicUrl: url });
    } catch (e) {
      Logger.log(e);
      throw new ServiceUnavailableException(
        "Erreur lors de la récupération de l'url publique"
      );
    }
  }
  @Get('/pinned')
  @UseGuards(AuthGuard)
  async getPinnedMessages(
    @Query('channelId') channelId: string
  ): Promise<MessageDto[]> {
    const messages = await this.messageService.findPinnedMsg(channelId);
    return messages.map((msg: Message) => plainToInstance(MessageDto, msg));
  }
  @Get('/userId')
  @UseGuards(AuthGuard)
  getUserId(@Req() request: Request) {
    console.log('dans le userId');
    const userId = request['user'].sub;
    return { userId };
  }
}
