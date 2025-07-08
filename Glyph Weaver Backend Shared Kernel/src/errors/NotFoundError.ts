// src/errors/NotFoundError.ts
import { ApiError } from './ApiError';

export class NotFoundError extends ApiError {
  public readonly statusCode = 404;

  constructor() {
    super('Not Found');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  public serializeErrors() {
    return [{ message: 'Not Found' }];
  }
}