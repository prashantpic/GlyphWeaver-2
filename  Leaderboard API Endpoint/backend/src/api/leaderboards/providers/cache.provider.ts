/**
 * @file Implements the caching logic using Redis to store and retrieve frequently accessed leaderboard data.
 * @description An infrastructure service that provides a simple, promise-based interface
 * for interacting with a distributed cache like Redis.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Providers
 */

import Redis from 'ioredis';
import { ICacheProvider } from '../interfaces/leaderboard.interfaces';

export class CacheProvider implements ICacheProvider {
  private readonly redisClient: Redis;

  /**
   * Initializes the Redis client using connection details from environment variables.
   */
  constructor() {
    if (!process.env.REDIS_URL) {
      throw new Error('REDIS_URL environment variable is not set.');
    }
    this.redisClient = new Redis(process.env.REDIS_URL, {
        // Recommended options for production
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
    });

    this.redisClient.on('error', (err) => {
        console.error('Redis Client Error', err);
    });
  }

  /**
   * Retrieves a value from the cache for a given key.
   * @param {string} key The key to retrieve.
   * @returns {Promise<string | null>} The cached value, or null if not found.
   */
  public async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  /**
   * Stores a key-value pair in the cache with a specified Time-To-Live (TTL).
   * @param {string} key The key to store.
   * @param {string} value The value to store.
   * @param {number} ttlSeconds The time-to-live in seconds.
   * @returns {Promise<void>}
   */
  public async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttlSeconds);
  }

  /**
   * Invalidates (deletes) keys from the cache that match a given pattern.
   * Uses SCAN for safe iteration over the keyspace in production.
   * @param {string} pattern The pattern to match keys against (e.g., 'leaderboard:my-key:*').
   * @returns {Promise<void>}
   */
  public async invalidateByPattern(pattern: string): Promise<void> {
    const stream = this.redisClient.scanStream({
      match: pattern,
      count: 100, // Process 100 keys at a time
    });

    const keysToDelete: string[] = [];
    stream.on('data', (keys) => {
      if (keys.length) {
        keysToDelete.push(...keys);
      }
    });

    return new Promise((resolve, reject) => {
      stream.on('end', async () => {
        if (keysToDelete.length > 0) {
            await this.redisClient.del(keysToDelete);
        }
        resolve();
      });
      stream.on('error', (err) => {
        console.error(`Error scanning Redis keys with pattern ${pattern}`, err);
        reject(err);
      });
    });
  }
}