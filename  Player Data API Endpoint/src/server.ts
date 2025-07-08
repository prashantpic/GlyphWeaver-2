import http from 'http';
import app from './app';
import { config } from './core/config';
import { connectDB } from './data/database';
import { logger } from './core/utils/logger'; // Assuming a logger utility is created

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.port, () => {
      logger.info(`Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const gracefulShutdown = (signal: string) => {
  process.on(signal, async () => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      // Disconnect from database
      require('mongoose').disconnect();
      logger.info('MongoDB connection closed.');
      process.exit(0);
    });
  });
};

startServer();

gracefulShutdown('SIGINT');
gracefulShutdown('SIGTERM');