import { Module } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { MessageController } from '../controller/message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../schema/message.schema';
import { MessageFile, MessageFileSchema } from '../schema/messageFile.schema';
import { provider } from 'src/config/constante';
import { StorageModule } from 'src/storage/storage.module';
import { AuthGuard } from '../../guards/authGuard';
import { TokenModule } from '../../token/token.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },
      { name: MessageFile.name, schema: MessageFileSchema },
    ]),
    StorageModule.register(provider),
    TokenModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, AuthGuard],
})
export class MessageModule {}
