import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { config } from './config';

// --- Import application components ---
// Data Layer
import RawAnalyticsEventModel from './infrastructure/data/models/raw-analytics-event.model';
import { RawAnalyticsEventRepository } from './infrastructure/data/repositories/raw-analytics-event.repository';
// Application Layer
import { AnalyticsIngestionService } from './application/services/analytics-ingestion.service';
// Presentation Layer (API)
import { createAnalyticsRouter } from './api/routes/analytics.routes';

const app: Express = express();

// --- Global Middleware ---
app.use(cors({ origin: config.corsOrigin })); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON request bodies

// --- Dependency Injection (Manual Wiring) ---
// This section instantiates our classes, "injecting" dependencies into the constructors.
// This decouples the components, making them easier to test and maintain.
const rawAnalyticsEventRepository = new RawAnalyticsEventRepository(RawAnalyticsEventModel);
const analyticsIngestionService = new AnalyticsIngestionService(rawAnalyticsEventRepository);
const analyticsRouter = createAnalyticsRouter(analyticsIngestionService);

// --- API Routes ---
app.use('/api/v1/analytics', analyticsRouter);

/**
 * A simple health check endpoint to verify that the service is running.
 * This is useful for load balancers and monitoring systems.
 */
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Global Error Handler ---
// This middleware must be the last one registered with `app.use`.
// It catches any errors passed via `next(error)` from any route handler.
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the full error stack for debugging purposes.
  // In a production environment, this should be a structured logger (e.g., Winston, Pino).
  console.error(err.stack);

  // Determine the status code from the error object, or default to 500 (Internal Server Error).
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected internal server error occurred.';

  // Send a structured JSON error response to the client.
  res.status(statusCode).json({
    error: {
      message,
      status: statusCode,
    },
  });
});

// --- Server Startup Logic ---
const startServer = async () => {
  try {
    // 1. Connect to the MongoDB database using the URI from the config.
    console.log('Connecting to MongoDB...');
    await mongoose.connect(config.mongodbUri);
    console.log('Successfully connected to MongoDB.');

    // 2. Start the Express server to listen for incoming HTTP requests.
    app.listen(config.port, () => {
      console.log(`Analytics API server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    // If the database connection or server startup fails, log the error and exit the process.
    // This ensures the application does not run in a broken state.
    console.error('Fatal error during server startup:', error);
    process.exit(1);
  }
};

// --- Run the Application ---
startServer();