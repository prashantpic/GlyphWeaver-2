import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { logger } from '../../utils/logger';
import { config } from '../../config';

/**
 * A global error handling middleware for Express.
 * It catches all errors passed via `next(error)` and sends a standardized JSON response.
 */
export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  logger.error(err, 'An unhandled error occurred in the request pipeline');

  const statusCode = err.statusCode || 500;
  
  const response = {
    message: err.message || 'An unexpected internal server error occurred.',
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  };

  // Avoid leaking sensitive error details in production for 500-level errors
  if (config.NODE_ENV === 'production' && statusCode >= 500) {
    response.message = 'An unexpected internal server error occurred.';
  }

  res.status(statusCode).json(response);
};