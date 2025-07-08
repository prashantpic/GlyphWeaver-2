import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../application/errors/app.error';

/**
 * Global error handling middleware.
 * This should be the last middleware added to the Express app.
 * It catches all errors passed to `next()` and formats them into a consistent JSON response.
 *
 * @param err The error object.
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The Express next function.
 */
export const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log the error internally for debugging purposes.
  // In a real application, use a proper logger like Winston or Pino.
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.stack || err.message}`);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    return;
  }
  
  // For security, don't leak details of unknown errors to the client.
  res.status(500).json({
    status: 'error',
    message: 'An unexpected internal server error occurred.',
  });
};