import { config } from './config/environment';
import { logger } from './config/logger';
import { initializeWorkers } from './workers';

async function startService(): Promise<void> {
  logger.info(`Starting glyph-puzzle-service-orchestrator in ${config.nodeEnv} mode.`);
  logger.info(`Log level set to: ${config.logLevel}`);

  try {
    await initializeWorkers();
    logger.info('Temporal workers initialized and started.');
  } catch (error) {
    logger.error('Failed to initialize Temporal workers:', error);
    process.exit(1);
  }

  logger.info('glyph-puzzle-service-orchestrator is running.');
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Shutting down glyph-puzzle-service-orchestrator gracefully...`);
  // Add any specific Temporal worker shutdown logic here if needed,
  // though Temporal workers are designed to handle shutdown signals.
  // For example, closing client connections if they are managed globally.
  logger.info('Graceful shutdown complete. Exiting.');
  process.exit(0);
}

// Handle graceful shutdown
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Optionally, exit or perform other cleanup
  // process.exit(1); // Consider if appropriate for your deployment strategy
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Optionally, exit or perform other cleanup
  // process.exit(1); // Consider if appropriate for your deployment strategy
});

startService().catch((error) => {
  logger.error('Failed to start service:', error);
  process.exit(1);
});