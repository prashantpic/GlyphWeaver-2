import { Redis, RedisOptions } from 'ioredis';
import { environmentConfig } from './environment';
import { logger } from '../utils/logger'; // Assuming logger.ts exists

let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<Redis> => {
  if (redisClient && redisClient.status === 'ready') {
    logger.info('Redis is already connected.');
    return redisClient;
  }

  try {
    logger.info('Attempting Redis connection...');
    const options: RedisOptions = {
      lazyConnect: true, // Connect explicitly
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000); // Exponential backoff
        return delay;
      },
    };
    
    redisClient = new Redis(environmentConfig.redisUrl, options);

    redisClient.on('connect', () => {
      logger.info('Connecting to Redis...');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client connected successfully and ready to use.');
    });

    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
      // Depending on the error, you might want to exit or implement more robust retry logic
      if (error.code === 'ECONNREFUSED' && redisClient && redisClient.status !== 'reconnecting') {
        logger.error('Redis connection refused. Application might not work as expected.');
      }
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis client is reconnecting...');
    });

    redisClient.on('end', () => {
      logger.warn('Redis connection ended.');
      redisClient = null; // Reset client for potential reconnection attempts
    });

    await redisClient.connect();
    return redisClient;

  } catch (error) {
    logger.error('Failed to initialize Redis connection:', error);
    // Potentially throw the error or exit if Redis is critical
    throw error; // Re-throw to be handled by server startup
  }
};

export const getRedisClient = (): Redis | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis client disconnected successfully.');
  } else {
    logger.info('Redis client is not connected.');
  }
};