import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CohereIaProvider } from './IaProvider/CohereIaProvider';
import { ChatBotController } from './chatBotController';
import { Message, MessageSchema } from '../message/schema/message.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from '../guards/authGuard';
import { TokenModule } from '../token/token.module';
import { CustomCacheModule } from 'src/cache/module/Cache.module';
export enum IaProviderType {
  cohere = 'cohere',
}

@Module({})
export class IaModule {
  static register(providerType: IaProviderType): DynamicModule {
    let provider;

    switch (providerType) {
      case IaProviderType.cohere:
        provider = {
          provide: 'IA_PROVIDER',
          useClass: CohereIaProvider,
        };
        break;
    }
    return {
      controllers: [ChatBotController],
      imports: [
        CustomCacheModule,
        ConfigModule,
        TokenModule,
        MongooseModule.forFeature([
          { name: Message.name, schema: MessageSchema },
        ]),
      ],
      module: IaModule,
      providers: [provider, AuthGuard],
      exports: [provider],
    };
  }
}
