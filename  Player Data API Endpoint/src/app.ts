import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { mainApiRouter } from './api';
import { handleErrors } from './core/middleware/errorHandler.middleware';
import { ApiError } from './core/errors/ApiError';

const app = express();

// Global Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount API routes
app.use('/api/v1', mainApiRouter);

// Handle 404 Not Found for any other routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, 'The requested resource was not found on this server.'));
});

// Global Error Handling Middleware (must be the last middleware)
app.use(handleErrors);

export default app;