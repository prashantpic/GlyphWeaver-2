import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { logger } from './utils/logger';
import { connectDB } from './infrastructure/database/mongo.connection';

import { MongoAnalyticsEventRepository } from './infrastructure/repositories/MongoAnalyticsEvent.repository';
import { AnalyticsIngestionService } from './application/services/AnalyticsIngestion.service';
import { AnalyticsController } from './presentation/controllers/Analytics.controller';
import { createAnalyticsRouter } from './presentation/routes/analytics.routes';
import { errorHandler } from './presentation/middleware/errorHandler.middleware';

/**
 * Main application bootstrap function.
 * Initializes the database, dependencies, server, middleware, and routes.
 */
const bootstrap = async () => {
  try {
    logger.info(`Starting Glyph Weaver Analytics Service in ${config.NODE_ENV} mode...`);

    // 1. Connect to the database
    await connectDB();

    // 2. Initialize dependencies (Dependency Injection)
    const mongoRepo = new MongoAnalyticsEventRepository();
    const ingestionService = new AnalyticsIngestionService(mongoRepo);
    const analyticsController = new AnalyticsController(ingestionService);

    // 3. Create Express App
    const app = express();

    // 4. Apply global middleware
    app.use(pinoHttp({ logger }));
    app.use(helmet());
    app.use(cors({ origin: config.CORS_ORIGIN, methods: ['POST'] }));
    app.use(express.json({ limit: '1mb' })); // Protect against large payloads

    // 5. Configure Routing
    const analyticsRouter = createAnalyticsRouter(analyticsController);
    const apiLimiter = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 100, // Limit each IP to 100 requests per window
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use('/api/v1/analytics', apiLimiter, analyticsRouter);

    // Health check endpoint
    app.get('/health', (req, res) => res.status(200).json({ status: 'UP' }));

    // 6. Add 404 Not Found handler
    app.use((req: Request, res: Response, next: NextFunction) => {
      res.status(404).json({ message: 'Resource not found' });
    });

    // 7. Add global error handler (must be last)
    app.use(errorHandler);

    // 8. Start the server
    app.listen(config.PORT, () => {
      logger.info(`🚀 Server is listening on port ${config.PORT}`);
    });
  } catch (error) {
    logger.fatal(error, 'A fatal error occurred during application startup.');
    process.exit(1);
  }
};

// Execute the bootstrap function
bootstrap();