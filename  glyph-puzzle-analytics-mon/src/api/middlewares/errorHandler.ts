import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../../services/LoggingService';
import { HttpError, AppError, ValidationError as CustomValidationError } from '../../utils/customError'; // Renamed to avoid conflict
import { config }from '../../config';

/**
 * Global error handling middleware for the Express application.
 * Catches errors, logs them, and sends standardized error responses.
 */
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  // Ensure error is an instance of Error
  if (!(err instanceof Error)) {
      err = new Error('An unknown non-Error value was thrown.');
  }

  // Log the error using the centralized logging service
  // Include request ID for correlation
  LoggingService.logError(err, {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: (req.body as any)?.userId || (req.params as any)?.userId || 'N/A',
      sessionId: (req.body as any)?.sessionId || 'N/A',
      isOperational: err instanceof AppError ? err.isOperational : false,
  });

  let statusCode = 500;
  let message = 'An unexpected error occurred.';
  let errorDetails: any = undefined;

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    if (err instanceof CustomValidationError) { // Use the renamed custom validation error
        errorDetails = err.details;
    }
  } else if (err instanceof AppError && !err.isOperational) {
      LoggingService.error('Critical Non-Operational Error Encountered!', err);
      statusCode = 500;
      message = config.environment.NODE_ENV !== 'production' ? `Critical Non-Operational Error: ${err.message}` : 'An unexpected error occurred.';
  } else if (err instanceof Error) {
       message = config.environment.NODE_ENV !== 'production' ? err.message : 'An unexpected error occurred.';
  }

  // If headers have already been sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode: statusCode,
    message: message,
    ...(errorDetails && { details: errorDetails }),
    ...(config.environment.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};