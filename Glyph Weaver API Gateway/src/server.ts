import http from 'http';
import app from './app';
import config from './config';
import logger from './utils/logger';

const server = http.createServer(app);

const startServer = () => {
    server.listen(config.port, () => {
        logger.info(`🚀 Server running on port ${config.port}`);
        logger.info(`Log level set to: ${config.logLevel}`);
    });
};

const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        logger.info('HTTP server closed.');
        // Add any other cleanup logic here (e.g., database connections)
        process.exit(0);
    });
};

// Listen for termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

startServer();