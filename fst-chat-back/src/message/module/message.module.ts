import { Module } from '@nestjs/common';
import { MessageService } from '../service/message.service';
import { MessageController } from '../controller/message.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from '../schema/message.schema';
import { MessageGateway } from '../gateway/message.gateway';
import { AuthModule } from 'src/auth/module/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    AuthModule, 
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageGateway],
  exports: [MessageService],
})
export class MessageModule {}
