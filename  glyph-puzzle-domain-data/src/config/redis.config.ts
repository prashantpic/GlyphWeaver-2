import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

const redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 3, // Optional: Configure retry strategy
    lazyConnect: true, // Optional: Connect on first command
});

redisClient.on('connect', () => {
    console.log('Connected to Redis successfully.');
});

redisClient.on('error', (err) => {
    console.error(`Redis connection error: ${err}`);
});

redisClient.on('reconnecting', () => {
    console.log('Reconnecting to Redis...');
});

redisClient.on('end', () => {
    console.log('Redis connection closed.');
});

// Graceful shutdown
process.on('SIGINT', () => {
    redisClient.quit(() => {
        console.log('Redis connection closed on app termination.');
        process.exit(0);
    });
});

export default redisClient;