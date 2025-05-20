import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../exceptions/http-exception';
import { logger } from '../utils/logger.util';

export const errorMiddleware = (
  error: Error | HttpException,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction, // Needs to be present for Express to recognize it as error middleware
): void => {
  let status: number;
  let message: string;
  let errors: any[] | undefined;

  if (error instanceof HttpException) {
    status = error.status;
    message = error.message;
    errors = error.errors;
  } else {
    // Handle unexpected errors
    status = 500;
    message = 'Internal Server Error';
    // Log the full error for unexpected issues
    logger.error(`Unhandled Error: ${error.message}`, { stack: error.stack, path: req.path, method: req.method });
  }

  const errorResponse: { message: string; errors?: any[]; path?: string, timestamp?: string } = {
    message,
    path: req.path,
    timestamp: new Date().toISOString(),
  };

  if (errors) {
    errorResponse.errors = errors;
  }
  
  // Avoid sending stack trace in production for HttpExceptions unless explicitly intended
  if (process.env.NODE_ENV !== 'production' && !(error instanceof HttpException) && error.stack) {
     // For generic errors in dev, you might want to include stack
     // errorResponse.stack = error.stack; 
  }


  res.status(status).json(errorResponse);
};