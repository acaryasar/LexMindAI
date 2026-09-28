import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis burada "best-effort" bir yardimci katman: token blacklist ve cache
 * gibi kritik-olmayan islevler icin kullanilir. Ucretsiz/Redis'siz ortamlarda
 * (ornek: Render free tier) uygulamanin acilmasini veya her istekte
 * beklemesini engellememesi icin baglanti hatalarinda sessizce "yok say,
 * guvenli varsayilana don" davranisi uygulanir - hic bir metod hata firlatip
 * istegi kilitlemez.
 */
@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private readonly enabled: boolean;

  constructor(private configService: ConfigService) {
    this.enabled = !!this.configService.get('REDIS_HOST');

    this.client = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD') || undefined,
      db: 0,
      lazyConnect: !this.enabled,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 3000,
      retryStrategy: (times) => {
        // Cok agresif yeniden baglanma denemesi yapma; en fazla 10s bekle
        return Math.min(times * 500, 10000);
      },
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis kullanilamiyor, cache/blacklist devre disi kalacak: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
    } catch {
      // yoksay
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (err) {
      this.logger.debug(`Redis set basarisiz (${key}): ${(err as Error).message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err) {
      this.logger.debug(`Redis get basarisiz (${key}): ${(err as Error).message}`);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.debug(`Redis del basarisiz (${key}): ${(err as Error).message}`);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (err) {
      // Redis erisilemezse guvenli varsayilan: blacklist kontrolu icin
      // "kara listede degil" kabul edilir (fail-open) - kullanicilar Redis
      // olmadan da giris yapabilsin diye.
      this.logger.debug(`Redis exists basarisiz (${key}): ${(err as Error).message}`);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
    } catch (err) {
      this.logger.debug(`Redis expire basarisiz (${key}): ${(err as Error).message}`);
    }
  }

  getClient(): Redis {
    return this.client;
  }
}
