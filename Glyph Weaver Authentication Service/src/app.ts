import express, { Express } from 'express';
import cors from 'cors';
import authRoutes from './api/v1/routes/auth.routes';
import { errorHandler } from './api/v1/middleware/error.handler';
import Logger from './infrastructure/logging/logger';
import morgan from 'morgan';

/**
 * Creates and configures the core Express application object.
 * @returns The configured Express application.
 */
export const createApp = (): Express => {
  const app: Express = express();

  // --- Middleware Configuration ---

  // Enable Cross-Origin Resource Sharing
  app.use(cors());

  // Parse incoming JSON requests
  app.use(express.json());

  // Parse URL-encoded data
  app.use(express.urlencoded({ extended: true }));
  
  // HTTP request logger middleware
  const morganStream = {
    write: (message: string) => {
      // Forward morgan logs to winston
      Logger.http(message.trim());
    },
  };
  app.use(morgan('dev', { stream: morganStream }));


  // --- API Routes ---

  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Mount the v1 authentication routes
  app.use('/api/v1/auth', authRoutes);


  // --- Error Handling ---

  // Register the global error handling middleware.
  // This must be the last middleware registered.
  app.use(errorHandler);

  return app;
};