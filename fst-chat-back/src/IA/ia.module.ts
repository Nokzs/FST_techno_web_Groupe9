import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CohereIaProvider } from './IaProvider/CohereIaProvider';
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
      imports: [ConfigModule],
      module: IaModule,
      providers: [provider],
      exports: [provider],
    };
  }
}
