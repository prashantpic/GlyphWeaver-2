import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../../utils/errors';
import { AppConfig } from '../../config';

/**
 * Global error handling middleware for the Express application.
 * It catches all errors passed via `next(error)` and sends a
 * structured JSON response to the client.
 *
 * @param err - The error object.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
export const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // For unexpected errors, log them and send a generic 500 response.
  // In production, we don't want to leak implementation details or stack traces.
  console.error('UNHANDLED ERROR 💥:', err);

  const message = AppConfig.NODE_ENV === 'production' 
    ? 'An unexpected error occurred. Please try again later.' 
    : err.message;

  return res.status(500).json({
    status: 'fail',
    message,
  });
};