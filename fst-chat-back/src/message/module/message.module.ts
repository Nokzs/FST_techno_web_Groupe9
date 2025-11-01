import { Module } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { MessageController } from '../controller/message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../schema/message.schema';
import { MessageGateway } from '../gateway/message.gateway';
import { TokenModule } from '../../token/token.module';
import { AuthGuard } from '../../guards/authGuard';
import { UserModule } from '../../user/module/user.module';
import { MessageTranslationService } from '../service/message-translation.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    TokenModule,
    UserModule,
  ],
  controllers: [MessageController],
  providers: [
    MessageService,
    MessageGateway,
    AuthGuard,
    MessageTranslationService,
  ],
  exports: [MessageService],
})
export class MessageModule {}
