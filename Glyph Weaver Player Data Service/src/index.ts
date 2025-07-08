import { app } from './presentation/server';
import { config } from './config';
import { connectDB, disconnectDB } from './infrastructure/database/mongo.connection';
import { logger } from './infrastructure/logging/logger';

const server = app.listen(config.PORT, async () => {
  try {
    await connectDB();
    logger.info(`Server is running on port ${config.PORT}`);
    logger.info(`Environment: ${config.NODE_ENV}`);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
});

const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully.`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));