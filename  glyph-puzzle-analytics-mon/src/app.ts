import express, { Express } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
// APM is initialized in server.ts. Auto-instrumentation should cover Express.
// If specific APM middleware for Express is needed (e.g. for custom transaction naming beyond auto-instrumentation),
// it would be added here, typically very early.
// import apm from 'elastic-apm-node';
import { requestLogger } from './api/middlewares/requestLogger';
import { errorHandler } from './api/middlewares/errorHandler';
import apiRoutes from './api/routes'; // Import aggregated routes
import { LoggingService } from './services/LoggingService'; // For any direct logging if needed in this file
import { config } from './config'; // To potentially access feature flags or env specific settings


/**
 * Initializes and configures the Express application.
 * @returns The configured Express application instance.
 */
export function initializeApp(): Express {
  const app = express();

  // Enable trust proxy if running behind a proxy (e.g., NGINX, ELB) for accurate IP, etc.
  // The number of proxies to trust can be configured.
  // app.set('trust proxy', 1); // Example: trust the first hop

  // Core Middleware Order:
  // 1. Request Logger (as early as possible to capture request details)
  app.use(requestLogger);

  // 2. CORS - Adjust options based on your security requirements
  app.use(cors({
    origin: '*', // TODO: Restrict to known origins in production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Specify allowed methods
    allowedHeaders: ['Content-Type', 'Authorization', 'X-User-Consent', 'X-Api-Key'], // Specify allowed headers
    credentials: true, // If you need to handle cookies or authorization headers
  }));

  // 3. Body parsing middleware
  app.use(bodyParser.json({ limit: '5mb' })); // Limit request body size to prevent abuse
  app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));


  // Optional: API Key Authentication Middleware
  // This would typically come after body parsing if the key is in the body,
  // or earlier if it's in headers.
  // import { apiKeyAuthMiddleware } from './api/middlewares/apiKeyAuth.middleware';
  // if (config.environment.ANALYTICS_API_KEY_HASH) { // Conditionally apply if API key is configured
  //   app.use(apiKeyAuthMiddleware);
  // }


  // Mount the main API routes under the /api prefix
  app.use('/api', apiRoutes);


  // Optional: Add a 404 handler for unmatched routes
  // This should come after all valid routes and before the global error handler.
  app.use((req, res, next) => {
    // Check if response has already been sent by a previous middleware/route handler
    if (!res.headersSent) {
        res.status(404).json({
            status: 'error',
            statusCode: 404,
            message: `Not Found - The requested resource ${req.method} ${req.originalUrl} does not exist.`,
        });
    } else {
        next(); // Ensure next is called if headers were sent but it wasn't an error for this handler
    }
  });


  // Global Error Handling Middleware - Must be the LAST middleware added
  app.use(errorHandler);

  LoggingService.info('Express application configured.');
  return app;
}