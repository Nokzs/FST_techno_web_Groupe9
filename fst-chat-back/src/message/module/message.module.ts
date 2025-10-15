import { Module } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { MessageController } from '../controller/message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../schema/message.schema';
import { MessageFile, MessageFileSchema } from '../schema/messageFile.schema';
import { provider } from 'src/config/constante';
import { StorageModule } from 'src/storage/storage.module';
import { MessageGateway } from '../gateway/message.gateway';
import { TokenModule } from '../../token/token.module';
import { AuthGuard } from '../../guards/authGuard';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: MessageFile.name, schema: MessageFileSchema },
    ]),
    TokenModule,
    StorageModule.register(provider),
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway, AuthGuard],
  exports: [MessageService, AuthGuard],
})
export class MessageModule {}
