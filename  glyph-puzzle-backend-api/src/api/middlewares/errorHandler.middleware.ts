import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError'; // Assuming ApiError.ts exists
import { logger } from '../../utils/logger'; // Assuming logger.ts exists
import { environmentConfig } from '../../config';

interface ErrorResponse {
  message: string;
  statusCode: number;
  stack?: string;
  errors?: any[]; // For validation errors or multiple issues
  isOperational?: boolean;
}

export const errorHandlerMiddleware = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  let errorResponse: ErrorResponse;

  if (err instanceof ApiError) {
    errorResponse = {
      message: err.message,
      statusCode: err.statusCode,
      isOperational: err.isOperational,
      errors: err.errors,
    };
    if (err.isOperational) {
        logger.warn(`Handled ApiError: ${err.statusCode} - ${err.message} - Path: ${req.path} - Errors: ${JSON.stringify(err.errors || {})}`);
    } else {
        logger.error(`Critical ApiError: ${err.statusCode} - ${err.message} - Path: ${req.path}`, err);
    }
  } else {
    // Handle non-ApiError instances (e.g., unexpected system errors)
    logger.error(`Unhandled Error: ${err.message} - Path: ${req.path}`, err);
    errorResponse = {
      message: 'An unexpected internal server error occurred.',
      statusCode: 500,
      isOperational: false, // These are typically not operational
    };
  }

  // Include stack trace only in development
  if (environmentConfig.nodeEnv === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.status(errorResponse.statusCode).json({
    success: false,
    message: errorResponse.message,
    ...(errorResponse.errors && { errors: errorResponse.errors }),
    ...(environmentConfig.nodeEnv === 'development' && errorResponse.stack && { stack: errorResponse.stack }),
  });
};