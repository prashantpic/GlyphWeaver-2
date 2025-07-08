import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'class-validator';
import Logger from '../../../infrastructure/logging/logger';

// --- Custom Error Classes ---
// Defining these here to avoid creating extra files, as per the generation constraints.
// In a larger project, these would be in their own `src/application/errors` directory.

export class ApiException extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = this.constructor.name;
    // Maintains proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestException extends ApiException {
  constructor(message = 'Bad Request') {
    super(400, message);
  }
}

export class UnauthorizedException extends ApiException {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenException extends ApiException {
    constructor(message = 'Forbidden') {
        super(403, message);
    }
}

export class NotFoundException extends ApiException {
  constructor(message = 'Not Found') {
    super(404, message);
  }
}

export class ConflictException extends ApiException {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}


/**
 * Global error handling middleware for the Express application.
 * Catches errors passed via `next(error)` and formats a consistent JSON response.
 *
 * @param err - The error object. Can be a standard Error, a custom ApiException, or an array of ValidationErrors.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log the error for debugging and auditing purposes
  Logger.error(err.stack || err.message);

  if (err instanceof ApiException) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      message: err.message,
      error: err.name.replace('Exception', ''),
    });
  }

  // Handle class-validator errors
  if (Array.isArray(err) && err[0] instanceof ValidationError) {
    const message = err.map((e: ValidationError) => Object.values(e.constraints || {})).join(', ');
    return res.status(400).json({
      statusCode: 400,
      message: message || 'Input validation failed',
      error: 'Bad Request',
    });
  }

  // Handle generic errors
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred on the server.';

  return res.status(statusCode).json({
    statusCode,
    message,
    error: 'Internal Server Error',
  });
};