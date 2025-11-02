import { Module, DynamicModule } from '@nestjs/common';
import { SupabaseStorageProvider } from './provider/SupabaseStorageProvider';
import { ConfigModule } from '@nestjs/config';
import { StorageController } from './controller/StorageController';
import { TokenModule } from '../token/token.module';
import { AuthGuard } from '../guards/authGuard';
export enum StorageProviderType {
  supabase = 'supabase',
}

export const STORAGE_PROVIDER = Symbol('STORAGE_PROVIDER');
@Module({})
export class StorageModule {
  static register(providerType: StorageProviderType): DynamicModule {
    let provider;

    switch (providerType) {
      case StorageProviderType.supabase:
        provider = {
          provide: 'STORAGE_PROVIDER',
          useClass: SupabaseStorageProvider,
        };
        break;
    }
    return {
      controllers: [StorageController],
      module: StorageModule,
      imports: [ConfigModule, TokenModule],
      providers: [provider, AuthGuard],
      exports: [provider],
    };
  }
}
