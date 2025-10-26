import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import * as crypto from 'crypto';
import type { Cache } from 'cache-manager';
export type QuestionCache = {
  question: string;
  answer: string;
  embedding: number[];
  norm: number;
};
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private getCacheKey(channelId: string): string {
    // Génère un hash court pour éviter les clés trop longues
    return `chat:${crypto.createHash('sha256').update(channelId).digest('hex').slice(0, 12)}`;
  }
  async cacheAnswer(
    channelId: string,
    question: string,
    answer: string,
    embedding: number[],
    norm: number
  ): Promise<void> {
    const key = this.getCacheKey(channelId);

    const existing = (await this.cacheManager.get<QuestionCache[]>(key)) || [];

    existing.push({ question, answer, embedding, norm });

    await this.cacheManager.set(key, existing);
  }
  async getCachedAnswers(channelId: string): Promise<QuestionCache[]> {
    const key = this.getCacheKey(channelId);
    return (await this.cacheManager.get(key)) || [];
  }

  async clearCache(channelId: string): Promise<void> {
    await this.cacheManager.del(this.getCacheKey(channelId));
  }
}
