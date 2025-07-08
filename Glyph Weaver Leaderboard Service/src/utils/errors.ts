import { ValidationError as ClassValidatorValidationError } from 'class-validator';

/**
 * Base class for custom application errors.
 */
export class BaseError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(name: string, statusCode: number, message: string, isOperational: boolean = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this);
  }
}

export class ServerError extends BaseError {
  constructor(message = 'An internal server error occurred') {
    super('ServerError', 500, message);
  }
}

export class NotFoundError extends BaseError {
  constructor(message = 'The requested resource was not found') {
    super('NotFoundError', 404, message);
  }
}

export class ForbiddenError extends BaseError {
  constructor(message = 'You do not have permission to perform this action') {
    super('ForbiddenError', 403, message);
  }
}

export class ValidationError extends BaseError {
  public readonly errors: any;
  constructor(errors: ClassValidatorValidationError[]) {
    const message = 'Invalid input data';
    super('ValidationError', 400, message);
    this.errors = errors.map(err => ({
      property: err.property,
      constraints: err.constraints,
    }));
  }
}