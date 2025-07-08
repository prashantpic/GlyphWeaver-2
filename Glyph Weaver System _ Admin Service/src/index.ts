import 'dotenv/config'; // Must be the first import
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';

import config from './config';
import mainRouter from './presentation/http/routes';
import { globalErrorHandler } from './presentation/http/middlewares/error.middleware';

// Import all dependencies for manual wiring
import { MongoGameConfigurationRepository } from './infrastructure/database/mongoose/repositories/game-configuration.repository.impl';
import { MongoAuditLogRepository } from './infrastructure/database/mongoose/repositories/audit-log.repository.impl';
import { GameConfigurationModel } from './infrastructure/database/mongoose/models/game-configuration.model';
import { AuditLogModel } from './infrastructure/database/mongoose/models/audit-log.model';
import { ConfigurationService } from './application/services/configuration.service';
import { PlayerDataRequestService } from './application/services/player-data-request.service';
import { SystemHealthService } from './application/services/system-health.service';
import { ConfigurationController } from './presentation/http/controllers/configuration.controller';
import { PlayerDataController } from './presentation/http/controllers/player-data.controller';
import { HealthController } from './presentation/http/controllers/health.controller';
import { PlayerServiceClient } from './infrastructure/clients/player-service.client';
import { setupDependencies } from './dependencies';

/**
 * @file The bootstrap file for the System & Admin Service. It orchestrates the startup sequence of the application.
 * @namespace GlyphWeaver.Backend.System
 */

async function bootstrap() {
  try {
    // 1. Establish database connection
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.DATABASE_URL);
    console.log('MongoDB connection established successfully.');

    // 2. Set up Dependency Injection
    // In a larger app, a DI container like InversifyJS would be used.
    // For this project, we manually wire the dependencies.
    console.log('Wiring application dependencies...');
    setupDependencies();
    console.log('Dependencies wired successfully.');

    // 3. Create Express application
    const app = express();

    // 4. Apply global middleware
    app.use(helmet()); // For security headers
    app.use(cors({ origin: config.CORS_ORIGIN })); // For CORS
    app.use(express.json()); // To parse JSON bodies
    app.set('trust proxy', 1); // Trust first proxy for IP address

    // 5. Mount API routes
    app.use('/api/v1', mainRouter);

    // 6. Mount global error handler (must be last)
    app.use(globalErrorHandler);

    // 7. Start the HTTP server
    app.listen(config.PORT, () => {
      console.log(`🚀 Server is listening on port ${config.PORT}`);
      console.log(`✅ Service running in ${config.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('❌ Fatal error during application startup:', error);
    process.exit(1);
  }
}

// Start the application
bootstrap();