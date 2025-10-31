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
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Message } from '../schema/message.schema';
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
  async create(
    @Body() createMessageDto: CreateMessageDto,
    @Req() req: Request
  ): Promise<Message> {
    const id = req['user'].sub;
    const message = await this.messageService.create(createMessageDto);
    if (!message) {
      throw new InternalServerErrorException(
        'Erreur lors de la création du message'
      );
    }
    return message;
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
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
  @Get('/userId')
  @UseGuards(AuthGuard)
  getUserId(@Req() request: Request) {
    console.log('dans le userId');
    const userId = request['user'].sub;
    return { userId };
  }
}
