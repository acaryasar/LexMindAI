import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { AIOrchestrationRequest, AIOrchestrationResponse } from '../orchestrator/interfaces/ai-orchestrator.interface';

@Injectable()
export class AICacheService {
  private readonly logger = new Logger(AICacheService.name);
  private redis: Redis;
  private readonly defaultTTL = 3600; // 1 hour

  constructor(private configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
    });

    this.redis.on('error', (err) => {
      this.logger.error('Redis error:', err);
    });
  }

  async get(request: AIOrchestrationRequest): Promise<AIOrchestrationResponse | null> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const cached = await this.redis.get(cacheKey);

      if (!cached) return null;

      this.logger.log(`Cache hit for key: ${cacheKey}`);
      return JSON.parse(cached);
    } catch (error) {
      this.logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(request: AIOrchestrationRequest, response: AIOrchestrationResponse, ttl?: number): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request);
      const value = JSON.stringify(response);
      const expiry = ttl || this.defaultTTL;

      await this.redis.setex(cacheKey, expiry, value);
      this.logger.log(`Cache set for key: ${cacheKey}, TTL: ${expiry}`);
    } catch (error) {
      this.logger.error('Cache set error:', error);
    }
  }

  async invalidate(request: AIOrchestrationRequest): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(request);
      await this.redis.del(cacheKey);
      this.logger.log(`Cache invalidated for key: ${cacheKey}`);
    } catch (error) {
      this.logger.error('Cache invalidate error:', error);
    }
  }

  async invalidateByPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Cache invalidated for pattern: ${pattern}, keys: ${keys.length}`);
      }
    } catch (error) {
      this.logger.error('Cache invalidate pattern error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.logger.log('Cache cleared');
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info('stats');
      const dbsize = await this.redis.dbsize();
      
      return {
        dbsize,
        info,
      };
    } catch (error) {
      this.logger.error('Cache stats error:', error);
      return null;
    }
  }

  private generateCacheKey(request: AIOrchestrationRequest): string {
    const keyParts = [
      'ai_orchestration',
      request.userId,
      request.agentType,
      JSON.stringify(request.context || {}),
      JSON.stringify(request.input),
    ];

    return keyParts.join(':');
  }
}
