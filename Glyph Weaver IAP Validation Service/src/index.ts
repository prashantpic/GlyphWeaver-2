import 'reflect-metadata';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import winston from 'winston';
import axios from 'axios';

import { config } from './config';
import { IAPController } from './api/v1/controllers/iap.controller';
import { IAPValidationService } from './application/services/iap-validation.service';
import { MongooseIAPTransactionRepository } from './infrastructure/repositories/mongoose-iap-transaction.repository';
import { AppleAppStoreValidator } from './infrastructure/gateways/apple-app-store.validator';
import { GooglePlayValidator } from './infrastructure/gateways/google-play.validator';
import { HttpPlayerServiceGateway } from './infrastructure/gateways/http-player.service.gateway';
import { IAPTransactionModel } from './infrastructure/mongodb/schemas/iap-transaction.schema';

/**
 * Main bootstrap function to initialize and start the microservice.
 */
async function bootstrap() {
    // --- 1. Configure Logger ---
    const logger = winston.createLogger({
        level: 'info',
        format: winston.format.json(),
        defaultMeta: { service: 'glyph-weaver-iap-service' },
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
            }),
        ],
    });

    if (config.env === 'production') {
        logger.add(new winston.transports.Console({ format: winston.format.json() }));
    }

    // --- 2. Connect to Database ---
    try {
        await mongoose.connect(config.mongo.uri);
        logger.info('Successfully connected to MongoDB.');
    } catch (error) {
        logger.error('Failed to connect to MongoDB.', { error });
        process.exit(1);
    }

    // --- 3. Initialize Application Components (Dependency Injection) ---
    const httpClient = axios.create({ timeout: 10000 }); // 10-second timeout

    // Gateways (Adapters)
    const appleValidator = new AppleAppStoreValidator(httpClient);
    const googleValidator = new GooglePlayValidator();
    const playerServiceGateway = new HttpPlayerServiceGateway(httpClient);

    // Repository
    const iapTransactionRepository = new MongooseIAPTransactionRepository(IAPTransactionModel);

    // Application Service (Core Logic)
    const iapValidationService = new IAPValidationService(
        iapTransactionRepository,
        playerServiceGateway,
        {
            ios: appleValidator,
            android: googleValidator,
        }
    );

    // API Controller (Presentation Layer)
    const iapController = new IAPController(iapValidationService);

    // --- 4. Create and Configure Express App ---
    const app: Express = express();

    // Essential Middleware
    app.use(helmet()); // Secure HTTP headers
    app.use(cors());   // Enable Cross-Origin Resource Sharing
    app.use(express.json()); // Parse JSON request bodies

    // Request Logging Middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
        logger.info(`Incoming Request: ${req.method} ${req.originalUrl}`, {
            ip: req.ip,
            body: req.body,
        });
        next();
    });

    // --- 5. Define API Routes ---
    const apiRouter = express.Router();
    apiRouter.post('/validate', (req, res, next) => iapController.validatePurchase(req, res, next));
    app.use('/api/v1/iap', apiRouter);

    // Health Check Endpoint
    app.get('/health', (req: Request, res: Response) => {
        res.status(200).json({ status: 'UP' });
    });

    // --- 6. Global Error Handling Middleware ---
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        logger.error('Unhandled Exception:', {
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
        });
        res.status(500).json({ message: 'Internal Server Error' });
    });

    // --- 7. Start the Server ---
    app.listen(config.port, () => {
        logger.info(`🚀 Server is running on port ${config.port} in ${config.env} mode.`);
    });
}

// --- Run the application ---
bootstrap().catch((error) => {
    console.error('Fatal error during bootstrap:', error);
    process.exit(1);
});