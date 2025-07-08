import * as dotenv from 'dotenv';
// Load environment variables from .env file at the very beginning
dotenv.config();

import { createApp } from './app';
import { connectDB } from './infrastructure/database/db.connection';
import Logger from './infrastructure/logging/logger';

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Bootstraps the application by connecting to the database
 * and starting the Express server.
 */
const bootstrap = async () => {
  try {
    // Establish database connection
    await connectDB();

    const app = createApp();

    // Start the HTTP server
    const server = app.listen(PORT, () => {
      Logger.info(`🚀 Server is running on port ${PORT} in ${NODE_ENV} mode.`);
    });

    // --- Graceful Shutdown ---
    const signals = ['SIGINT', 'SIGTERM'];

    signals.forEach((signal) => {
      process.on(signal, () => {
        Logger.info(`Received ${signal}, shutting down gracefully...`);
        server.close(() => {
          Logger.info('HTTP server closed.');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    Logger.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

// Start the application
bootstrap();