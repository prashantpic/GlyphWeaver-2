import Redis, { Redis as RedisClient } from 'ioredis';
import { ICacheService } from './interfaces/ICacheService';
import { logger } from '../utils/logger'; // Assuming logger is in src/utils
import { environmentConfig } from '../config'; // Assuming config is in src/config

export class CacheService implements ICacheService {
    private client: RedisClient;

    constructor(redisClient?: RedisClient) {
        if (redisClient) {
            this.client = redisClient;
        } else {
            // This is a fallback, ideally client is injected after connection in server.ts
            logger.warn('CacheService: Redis client not injected, attempting to create a new instance.');
            this.client = new Redis(environmentConfig.redisUrl, {
                maxRetriesPerRequest: 3,
                lazyConnect: true, // Connect on first command
            });

            this.client.on('error', (err) => {
                logger.error('Redis Client Error (CacheService fallback)', err);
            });
            this.client.on('connect', () => {
                logger.info('CacheService fallback client connected to Redis');
            });
        }
    }

    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await this.client.get(key);
            if (data) {
                return JSON.parse(data) as T;
            }
            return null;
        } catch (error) {
            logger.error(`Error getting cache for key ${key}:`, error);
            return null;
        }
    }

    async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
        try {
            const stringValue = JSON.stringify(value);
            if (ttlSeconds) {
                await this.client.set(key, stringValue, 'EX', ttlSeconds);
            } else {
                await this.client.set(key, stringValue);
            }
        } catch (error) {
            logger.error(`Error setting cache for key ${key}:`, error);
        }
    }

    async del(key: string): Promise<void> {
        try {
            await this.client.del(key);
        } catch (error) {
            logger.error(`Error deleting cache for key ${key}:`, error);
        }
    }

    async increment(key: string): Promise<number> {
        try {
            return await this.client.incr(key);
        } catch (error) {
            logger.error(`Error incrementing cache for key ${key}:`, error);
            throw error; // Re-throw as increment might be critical
        }
    }

    async expire(key: string, ttlSeconds: number): Promise<void> {
        try {
            await this.client.expire(key, ttlSeconds);
        } catch (error) {
            logger.error(`Error setting expiry for key ${key}:`, error);
        }
    }

    getClient(): RedisClient {
        return this.client;
    }
}