import http from 'http';
import { initializeApp } from './app';
import { config, isProduction } from './config'; // isProduction can be derived from config.environment.NODE_ENV
import { LoggingService } from './services/LoggingService';
import { ApmService } from './services/ApmService';
import { elasticsearchConnector } from './connectors/ElasticsearchConnector';

// Initialize APM agent BEFORE requiring the app or other modules where possible.
// This ensures maximum code coverage for auto-instrumentation.
ApmService.initialize(); // This calls apm.start() if active

// Initialize Logging Service (Winston is configured via its module, but this is a good place for any explicit setup)
// LoggingService.initialize(); // If LoggingService had a static initialize method. Current one is ready on import.
LoggingService.info('Logging service initialized.');

// Initialize Elasticsearch Connector if direct ingestion is enabled
if (config.environment.ENABLE_ELASTICSEARCH_DIRECT_INGESTION) {
    elasticsearchConnector.initialize(); // This checks its own `isInitialized` flag.
} else {
    LoggingService.info('Elasticsearch direct ingestion is disabled by configuration.');
}

// Initialize the Express application AFTER critical services like APM and Logging are ready.
const app = initializeApp();

const PORT = config.environment.PORT;
const server = http.createServer(app);

/**
 * Starts the HTTP server and listens on the configured port.
 */
function startServer() {
  server.listen(PORT, () => {
    LoggingService.info(`🚀 Server running on port ${PORT} in ${config.environment.NODE_ENV} mode.`);
    LoggingService.info(`🔗 Health checks available at http://localhost:${PORT}/api/health`);
    LoggingService.info(`📊 Prometheus metrics available at http://localhost:${PORT}/api/metrics`);
    LoggingService.info(`✉️ Analytics ingestion endpoint at http://localhost:${PORT}/api/analytics/v1/events`);

    if (config.apmConfig.active) {
       LoggingService.info(`🔍 Elastic APM active for service: ${config.apmConfig.serviceName}. Target: ${config.apmConfig.serverUrl || config.apmConfig.cloudId}`);
    } else {
       LoggingService.info('🔍 Elastic APM is inactive.');
    }

    if (config.environment.ENABLE_ELASTICSEARCH_DIRECT_INGESTION) {
        if (elasticsearchConnector['isInitialized']) { // Accessing private-like field for check, better with a getter
            LoggingService.info(`💾 Elasticsearch direct ingestion enabled and connector initialized. Target: ${config.environment.ELASTICSEARCH_NODE_URL || config.environment.ELASTICSEARCH_CLOUD_ID}`);
        } else {
            LoggingService.warn('⚠️ Elasticsearch direct ingestion is enabled BUT connector failed to initialize. Events will be logged via Winston if AnalyticsService falls back.');
        }
    }
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.syscall !== 'listen') {
      throw error;
    }
    // Handle specific listen errors with friendly messages
    switch (error.code) {
      case 'EACCES':
        LoggingService.error(`Port ${PORT} requires elevated privileges.`);
        process.exit(1);
        break;
      case 'EADDRINUSE':
        LoggingService.error(`Port ${PORT} is already in use.`);
        process.exit(1);
        break;
      default:
        throw error;
    }
  });
}

/**
 * Handles graceful shutdown of the server and related services.
 */
async function gracefulShutdown(signal: string) {
  LoggingService.info(`Received signal ${signal}. Attempting graceful shutdown...`);

  server.close(async (err?: Error) => {
    if (err) {
      LoggingService.error('Error during HTTP server close:', err);
      // process.exit(1); // Potentially exit if server close fails critically
    } else {
      LoggingService.info('✅ HTTP server closed successfully.');
    }

    // Close Elasticsearch connector connection if it was initialized
    if (config.environment.ENABLE_ELASTICSEARCH_DIRECT_INGESTION && elasticsearchConnector['isInitialized']) {
      try {
        await elasticsearchConnector.close();
        LoggingService.info('✅ Elasticsearch connector closed successfully.');
      } catch (esCloseError) {
        LoggingService.error('Error closing Elasticsearch connector:', esCloseError);
      }
    }

    // Add any other cleanup tasks here (e.g., closing database connections, releasing resources)

    LoggingService.info('🚪 Application shutdown complete.');
    process.exit(err ? 1 : 0); // Exit with 0 on success, 1 on error during shutdown
  });

  // Set a timeout for forceful shutdown if graceful shutdown takes too long
  const shutdownTimeout = 10000; // 10 seconds
  setTimeout(() => {
    LoggingService.error('Graceful shutdown timeout exceeded! Forcing exit.');
    process.exit(1); // Force exit
  }, shutdownTimeout);
}

// Start the server
try {
    startServer();
} catch (e: any) {
    LoggingService.error('Failed to start server:', e);
    process.exit(1);
}


// Listen for termination signals to trigger graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Kubernetes, Docker stop
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C

// Handle uncaught exceptions and unhandled promise rejections as a last resort.
// These indicate programming errors that should be fixed.
process.on('uncaughtException', (error: Error, origin: string) => {
  LoggingService.error('UNCAUGHT EXCEPTION!', {
    error: { message: error.message, stack: error.stack, name: error.name },
    origin,
    isOperational: false, // Typically, uncaught exceptions are not operational
  });
  // It's generally recommended to exit after an uncaught exception,
  // as the application state might be corrupted.
  // Ensure logs are flushed before exiting.
  LoggingService.getWinstonLogger().on('finish', () => process.exit(1));
  LoggingService.getWinstonLogger().end(); // Attempt to flush logs
  // Fallback exit if logger doesn't finish quickly
  setTimeout(() => process.exit(1), 3000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  LoggingService.error('UNHANDLED PROMISE REJECTION!', {
    reason: reason instanceof Error ? { message: reason.message, stack: reason.stack, name: reason.name } : reason,
    // promise, // Logging the promise object itself might be too verbose
    isOperational: false, // Unhandled rejections are typically not operational
  });
  // Similar to uncaughtException, consider exiting.
  LoggingService.getWinstonLogger().on('finish', () => process.exit(1));
  LoggingService.getWinstonLogger().end();
  setTimeout(() => process.exit(1), 3000);
});