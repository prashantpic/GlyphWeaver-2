import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet'; // For basic security headers
import hpp from 'hpp'; // To protect against HTTP Parameter Pollution attacks
import compression from 'compression'; // To compress responses

import { environmentConfig } from './config/environment'; // Will be created
import logger from './utils/logger';
import ApiError from './utils/ApiError';

// Import middleware (These will be created in subsequent steps)
import { requestLoggerMiddleware } from './api/middlewares/requestLogger.middleware';
import { rateLimiter } from './api/middlewares/rateLimit.middleware';
import { errorHandlerMiddleware } from './api/middlewares/errorHandler.middleware';
// import { authMiddleware } from './api/middlewares/auth.middleware'; // Example for future use

// Import routes (These will be created in subsequent steps)
import mainRouterV1 from './api/routes/index'; // Main router for v1 API

// Import Swagger setup (This will be created in subsequent steps)
import { setupSwagger }sfrom './config/swagger';

const app: Express = express();

// Security Middleware
app.use(helmet()); // Set various HTTP headers for security
app.use(hpp());    // Prevent HTTP Parameter Pollution

// Enable CORS - Cross-Origin Resource Sharing
app.use(cors({
  origin: environmentConfig.corsAllowedOrigins,
  credentials: true, // If you need to handle cookies or authorization headers
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: '10mb' })); // Adjust limit as needed
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware for response compression
app.use(compression());

// Request logging middleware (custom)
app.use(requestLoggerMiddleware);

// API Rate Limiting middleware (global or apply to specific routes)
app.use('/api', rateLimiter); // Apply rate limiter to all /api routes

// API Documentation (Swagger/OpenAPI)
// The setupSwagger function will configure swagger-ui-express
setupSwagger(app); // This will mount Swagger UI typically at /api-docs

// API Routes
app.use('/api/v1', mainRouterV1); // Mount main API router

// Health check endpoint (can be part of mainRouterV1 or separate)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // Node.js process uptime in seconds
  });
});

// Handle 404 Not Found for any unhandled routes
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Not Found: The requested resource does not exist.'));
});

// Global error handling middleware (must be the last middleware)
app.use(errorHandlerMiddleware);

export default app;