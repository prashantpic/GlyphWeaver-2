import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../errors/ApiError';
import { logger } from '../utils/logger'; // Assuming a logger utility is created
import { ValidationError } from 'joi';

/**
 * Global error handling middleware.
 * Catches errors from the application, logs them, and sends a standardized
 * JSON response to the client.
 *
 * @param err - The error object.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
export const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  
  if (err instanceof ApiError) {
    // Handle custom API errors
    logger.warn(`ApiError: ${err.statusCode} - ${err.message} - URL: ${req.originalUrl} - Method: ${req.method} - IP: ${req.ip}`);
    res.status(err.statusCode).json({
      error: {
        message: err.message,
      },
    });
  } else if (err instanceof ValidationError) {
    // Handle Joi validation errors
    logger.warn(`ValidationError: 400 - ${err.message} - URL: ${req.originalUrl}`);
    res.status(400).json({
        error: {
            message: 'Validation failed',
            details: err.details.map(d => d.message),
        }
    });
  }
  else {
    // Handle all other unexpected errors
    logger.error(`InternalServerError: 500 - ${err.message}`, { stack: err.stack });

    // Do not leak stack trace to the client in production
    const errorMessage = process.env.NODE_ENV === 'production'
      ? 'An unexpected internal server error occurred.'
      : err.message;
      
    res.status(500).json({
      error: {
        message: 'Internal Server Error',
        // Optional: include error message in non-production environments
        ...(process.env.NODE_ENV !== 'production' && { details: errorMessage }),
      },
    });
  }
};