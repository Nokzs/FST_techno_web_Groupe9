import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageController } from '../controller/message.controller';
import { MessageGateway } from '../gateway/message.gateway';
import { MessageService } from '../service/message.service';
import { MessageTranslationService } from '../service/message-translation.service';
import { Message, MessageSchema } from '../schema/message.schema';
import { MessageFile, MessageFileSchema } from '../schema/messageFile.schema';
import { Reaction, ReactionSchema } from '../schema/reaction.schema';
import { User, UserSchema } from '../../user/schema/user.schema';
import { Channel, ChannelSchema } from '../../channel/schema/channel.schema';
import { Server, ServerSchema } from '../../server/schema/server.schema';
import { StorageModule } from '../../storage/storage.module';
import { TokenModule } from '../../token/token.module';
import { AuthGuard } from '../../guards/authGuard';
import { provider } from '../../config/constante'; // ✅ corrige le chemin si besoin

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: MessageFile.name, schema: MessageFileSchema },
      { name: Reaction.name, schema: ReactionSchema },
      { name: User.name, schema: UserSchema },
      { name: Channel.name, schema: ChannelSchema },
      { name: Server.name, schema: ServerSchema },
    ]),
    TokenModule,
    StorageModule.register(provider),
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    MessageTranslationService,
    MessageGateway,
    AuthGuard,
  ],
  exports: [MessageService, MessageTranslationService, AuthGuard],
})
export class MessageModule {}
