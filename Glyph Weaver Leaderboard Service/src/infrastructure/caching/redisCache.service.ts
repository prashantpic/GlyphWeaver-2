import { createClient, RedisClientType } from 'redis';
import { ICacheService } from '../../application/interfaces/ICacheService';
import { config } from '../../config';
import { logger } from '../../utils/logger';

/**
 * Redis-specific implementation of the ICacheService interface.
 * It encapsulates all Redis-specific commands and connection management.
 */
export class RedisCacheService implements ICacheService {
  private redisClient: RedisClientType;

  constructor() {
    this.redisClient = createClient({
      url: config.REDIS_URL,
    });

    this.redisClient.on('error', (err) => logger.error('Redis Client Error', err));
    this.redisClient.on('connect', () => logger.info('Connected to Redis server.'));
    this.redisClient.on('reconnecting', () => logger.warn('Reconnecting to Redis server...'));
  }

  public async connect(): Promise<void> {
    if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
    }
  }

  public async disconnect(): Promise<void> {
    if (this.redisClient.isOpen) {
        await this.redisClient.quit();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`Error getting key ${key} from Redis`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redisClient.set(key, stringValue, { EX: ttlSeconds });
      } else {
        await this.redisClient.set(key, stringValue);
      }
    } catch (error) {
      logger.error(`Error setting key ${key} in Redis`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      logger.error(`Error deleting key ${key} from Redis`, error);
    }
  }

  async delByPattern(pattern: string): Promise<void> {
    try {
        const keysToDelete: string[] = [];
        for await (const key of this.redisClient.scanIterator({ MATCH: pattern, COUNT: 100 })) {
            keysToDelete.push(key);
        }
        if (keysToDelete.length > 0) {
            await this.redisClient.del(keysToDelete);
            logger.info(`Invalidated ${keysToDelete.length} keys for pattern: ${pattern}`);
        }
    } catch (error) {
        logger.error(`Error deleting keys by pattern ${pattern} from Redis`, error);
    }
  }
}