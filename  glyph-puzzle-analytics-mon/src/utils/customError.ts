/**
 * Base custom error class for application-specific errors.
 * @param name - The name of the error.
 * @param message - The error message.
 * @param isOperational - Indicates if this is an operational error (expected) vs. a programming error.
 * @param stack - Optional stack trace.
 */
export class AppError extends Error {
  public readonly name: string;
  public readonly isOperational: boolean;

  constructor(name: string, message: string, isOperational: boolean = true, stack?: string) {
    super(message);
    this.name = name;
    this.isOperational = isOperational;

    // Restore stack trace if provided, otherwise capture it
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Custom error class for HTTP-related errors with a status code.
 * @param statusCode - The HTTP status code.
 * @param message - The error message.
 * @param stack - Optional stack trace.
 */
export class HttpError extends AppError {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string, stack?: string) {
    super('HttpError', message, statusCode >= 400 && statusCode < 500, stack);
    this.statusCode = statusCode;
  }
}

/**
 * Custom error class for validation errors.
 * @param message - The error message.
 * @param details - Optional details about validation failures.
 * @param stack - Optional stack trace.
 */
export class ValidationError extends HttpError {
  public readonly details?: any;

  constructor(message: string = 'Validation Failed', details?: any, stack?: string) {
    super(400, message, stack); // 400 Bad Request
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * Custom error class for consent-related errors (REQ-AMOT-001).
 * @param message - The error message.
 * @param stack - Optional stack trace.
 */
export class ConsentError extends HttpError {
  constructor(message: string = 'User consent not granted for analytics tracking.', stack?: string) {
    super(403, message, stack); // 403 Forbidden
    this.name = 'ConsentError';
  }
}

/**
 * Custom error class for authentication/authorization errors.
 * @param message - The error message.
 * @param stack - Optional stack trace.
 */
export class AuthError extends HttpError {
    constructor(message: string = 'Authentication failed.', stack?: string) {
      super(401, message, stack); // 401 Unauthorized
      this.name = 'AuthError';
    }
}