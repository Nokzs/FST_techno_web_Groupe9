// cache.module.ts
import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CacheService } from '../service/Cache.service';

@Global() // rend le module accessible partout
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 36000000, // TTL par défaut
      max: 100, // optionnel, limite en mémoire
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class CustomCacheModule {}
