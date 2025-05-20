import Redis, { RedisOptions, SetArgument } from 'ioredis';
import dotenv from 'dotenv';

// Load environment variables if this service might be used standalone or before index.ts
// This ensures that process.env.REDIS_URL is available.
dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisOptions: RedisOptions = {
  // Configure retry strategy (ioredis default is suitable for many cases)
  maxRetriesPerRequest: 3, // Example: limit retries for individual commands
  enableOfflineQueue: true, // Queue commands when client is offline
  // Add other options as needed, e.g., password, db, connection timeouts
  // password: process.env.REDIS_PASSWORD,
  // db: parseInt(process.env.REDIS_DB || '0', 10),
  // connectTimeout: 10000,
};

let client: Redis;

class RedisClientService {
  private static instance: RedisClientService;

  private constructor() {
    client = new Redis(redisUrl, redisOptions);

    client.on('connect', () => {
      console.log('Redis client: Successfully connected to Redis server.');
    });

    client.on('ready', () => {
      console.log('Redis client: Ready to process commands.');
    });

    client.on('error', (err: Error) => {
      console.error('Redis client error:', err.message);
      // ioredis handles reconnection automatically based on retryStrategy.
      // You might add more sophisticated error handling or alerting here.
    });

    client.on('close', () => {
      console.warn('Redis client: Connection to Redis server closed.');
    });

    client.on('reconnecting', (delay: number) => {
      console.log(`Redis client: Reconnecting to Redis server in ${delay}ms...`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      client.quit(() => {
        console.log('Redis client: Connection closed due to application termination (SIGINT).');
        process.exit(0);
      });
    });
    process.on('SIGTERM', () => {
      client.quit(() => {
        console.log('Redis client: Connection closed due to application termination (SIGTERM).');
        process.exit(0);
      });
    });
  }

  public static getInstance(): RedisClientService {
    if (!RedisClientService.instance) {
      RedisClientService.instance = new RedisClientService();
    }
    return RedisClientService.instance;
  }

  public getClient(): Redis {
    return client;
  }

  public async get(key: string): Promise<string | null> {
    try {
      return await client.get(key);
    } catch (error) {
      console.error(`Redis GET error for key "${key}":`, error);
      throw error; // Re-throw or handle as per application error strategy
    }
  }

  public async set(
    key: string,
    value: string,
    options?: {
      EX?: number; // Set the specified expire time, in seconds.
      PX?: number; // Set the specified expire time, in milliseconds.
      NX?: boolean; // Only set the key if it does not already exist.
      XX?: boolean; // Only set the key if it already exist.
      KEEPTTL?: boolean; // Retain the time to live associated with the key.
      GET?: boolean; // Return the old string stored at key, or nil if key did not exist.
    }
  ): Promise<string | null> {
    const args: SetArgument[] = [];
    if (options) {
      if (options.EX !== undefined) args.push('EX', options.EX);
      if (options.PX !== undefined) args.push('PX', options.PX);
      if (options.NX) args.push('NX');
      if (options.XX) args.push('XX');
      if (options.KEEPTTL) args.push('KEEPTTL');
      if (options.GET) args.push('GET');
    }

    try {
      if (args.length > 0) {
        // The type signature for client.set with options can be tricky.
        // Using `any` for args here to simplify, but ensure type safety if possible.
        return await client.set(key, value, ...(args as any));
      }
      return await client.set(key, value);
    } catch (error) {
      console.error(`Redis SET error for key "${key}":`, error);
      throw error;
    }
  }

  public async increment(key: string): Promise<number> {
    try {
      return await client.incr(key);
    } catch (error) {
      console.error(`Redis INCR error for key "${key}":`, error);
      throw error;
    }
  }

  public async expire(key: string, seconds: number): Promise<number> {
    try {
      return await client.expire(key, seconds);
    } catch (error)
    {
      console.error(`Redis EXPIRE error for key "${key}":`, error);
      throw error;
    }
  }

  public async del(key: string | string[]): Promise<number> {
    try {
      return await client.del(Array.isArray(key) ? key : [key]);
    } catch (error) {
      console.error(`Redis DEL error for key(s) "${key}":`, error);
      throw error;
    }
  }

  // Example of other common commands
  public async hget(key: string, field: string): Promise<string | null> {
    try {
      return await client.hget(key, field);
    } catch (error) {
      console.error(`Redis HGET error for key "${key}", field "${field}":`, error);
      throw error;
    }
  }

  public async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await client.hset(key, field, value);
    } catch (error) {
      console.error(`Redis HSET error for key "${key}", field "${field}":`, error);
      throw error;
    }
  }

  public async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await client.hgetall(key);
    } catch (error) {
      console.error(`Redis HGETALL error for key "${key}":`, error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    console.log('Redis client: Disconnecting...');
    await client.quit();
  }
}

// Export the singleton instance.
// Plugins and policies can import this instance to use the Redis client.
export const redisClientService = RedisClientService.getInstance();