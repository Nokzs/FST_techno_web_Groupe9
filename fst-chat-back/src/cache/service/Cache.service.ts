import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
export type QuestionCache = {
  answer: Answer[];
  embedding: number[];
  norm: number;
};
export type Answer = {
  answer: string;
  lang: string;
};
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private getCacheKey(channelId: string): string {
    // Génère un hash court pour éviter les clés trop longues
    return `chat:${channelId}`;
  }
  async cacheAnswer(
    channelId: string,
    answer: string,
    lang: string,
    embedding: number[]
  ): Promise<void> {
    Logger.log(`Caching "${answer}" for channel ${channelId} in ${lang}`);
    const key = this.getCacheKey(channelId);

    // Récupère les entrées existantes
    const existing = (await this.cacheManager.get<QuestionCache[]>(key)) || [];
    Logger.log(
      `Existing cache entries for key ${key}: ${JSON.stringify(existing)}`
    );
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));

    // Vérifie si une entrée pour ce même embedding existe déjà
    const cacheEntry = existing.find(
      (e) =>
        e.embedding.length === embedding.length &&
        e.embedding.every((v, i) => v === embedding[i])
    );

    if (cacheEntry) {
      // Si la langue existe déjà, on écrase la réponse, sinon on ajoute
      const existingLang = cacheEntry.answer.find((a) => a.lang === lang);
      if (existingLang) {
        existingLang.answer = answer;
      } else {
        cacheEntry.answer.push({ answer, lang });
      }
    } else {
      // Nouvelle entrée pour cet embedding
      existing.push({ answer: [{ answer, lang }], embedding, norm });
    }

    Logger.log(await this.cacheManager.set(key, existing));

    /*Logger.log(`Cache updated for key ${key} and channel ${channelId}`);
    Logger.log(
      `Existing cache entries after updates for key ${key}: ${JSON.stringify(existing)}`
    );*/
    Logger.log('cache after', await this.getCachedAnswers(channelId));
  }
  async getCachedAnswers(channelId: string): Promise<QuestionCache[]> {
    const key = this.getCacheKey(channelId);
    Logger.log(`Retrieving cache for channel ${channelId} with key ${key}`);
    return (await this.cacheManager.get(key)) || [];
  }

  async clearCache(channelId: string): Promise<void> {
    await this.cacheManager.del(this.getCacheKey(channelId));
  }
  async getValue() {
    return this.cacheManager.get('my-test-key');
  }
  async testCache(): Promise<void> {
    const testKey = 'my-test-key';
    await this.cacheManager.set(testKey, { hello: 'world' });
  }
}
