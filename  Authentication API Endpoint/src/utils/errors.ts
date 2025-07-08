/**
 * @file Defines custom error classes for the application.
 */

/**
 * Base class for all application-specific errors.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this);
  }
}

/**
 * Represents a validation error (HTTP 400).
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Represents an authentication or authorization error (HTTP 401).
 */
export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

/**
 * Represents a resource not found error (HTTP 404).
 */
export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

/**
 * Represents a conflict error, e.g., resource already exists (HTTP 409).
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}