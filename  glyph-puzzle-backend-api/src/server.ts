import http from 'http';
import app from './app';
import logger from './utils/logger';
import { environmentConfig } from './config/environment'; // Will be created
import { connectDB } from './config/database'; // Will be created
import { connectRedis, getRedisClient, disconnectRedis } from './config/redis'; // Will be created

let server: http.Server;

const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('Successfully connected to MongoDB.');

    // Connect to Redis
    await connectRedis();
    const redisClient = getRedisClient(); // Ensure client is available
    if (redisClient && (redisClient.status === 'ready' || redisClient.status === 'connect')) {
        logger.info('Successfully connected to Redis.');
    } else {
        logger.warn('Redis client not ready or connection failed during startup.');
        // Decide if this is critical; for now, we log and continue
    }


    server = http.createServer(app);

    server.listen(environmentConfig.port, () => {
      logger.info(`Server is running on port ${environmentConfig.port} in ${environmentConfig.nodeEnv} mode.`);
      logger.info(`API documentation available at /api-docs (if Swagger is enabled).`);
    });

  } catch (error) {
    logger.error('Failed to start the server:', error);
    process.exit(1); // Exit with failure
  }
};

const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  
  server.close(async () => {
    logger.info('HTTP server closed.');

    // Disconnect Redis
    try {
      await disconnectRedis();
      logger.info('Redis connection closed.');
    } catch (error) {
      logger.error('Error closing Redis connection:', error);
    }
    
    // Mongoose handles its own disconnection on process exit,
    // or you can explicitly call mongoose.disconnect() if needed.
    // For example, if connectDB in database.ts sets up listeners for SIGINT/SIGTERM:
    // await mongoose.disconnect();
    // logger.info('MongoDB connection closed.');


    logger.info('Graceful shutdown complete.');
    process.exit(0);
  });

  // If server hasn't finished in a timeout period, force shutdown
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000); // 10 seconds timeout
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error | any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, shut down the server if it's a critical unhandled rejection
  // gracefulShutdown('UNHANDLED_REJECTION'); 
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // It's generally recommended to shut down after an uncaught exception,
  // as the application might be in an inconsistent state.
  // gracefulShutdown('UNCAUGHT_EXCEPTION'); // This might be too abrupt.
  // For a robust system, you might log and then exit, allowing a process manager to restart.
  process.exit(1); // Exit after logging
});

startServer();