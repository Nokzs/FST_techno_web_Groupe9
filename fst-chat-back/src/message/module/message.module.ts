import { Module } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { MessageController } from '../controller/message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../schema/message.schema';
import { MessageFile, MessageFileSchema } from '../schema/messageFile.schema';
import { provider } from '../../config/constante';
import { StorageModule } from '../../storage/storage.module';
import { MessageGateway } from '../gateway/message.gateway';
import { TokenModule } from '../../token/token.module';
import { AuthGuard } from '../../guards/authGuard';
import { Reaction, ReactionSchema } from '../schema/reaction.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IaModule } from '../../IA/ia.module';
import { iaProvider } from '../../config/constante';
import { UserModule } from 'src/user/module/user.module';
import { ChannelModule } from 'src/channel/module/channel.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: MessageFile.name, schema: MessageFileSchema },
      { name: Reaction.name, schema: ReactionSchema },
    ]),
    UserModule,
    TokenModule,
    StorageModule.register(provider),
    ConfigModule,
    IaModule.register(iaProvider),
    ChannelModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway, AuthGuard, ConfigService],
  exports: [MessageService, AuthGuard],
})
export class MessageModule {}
