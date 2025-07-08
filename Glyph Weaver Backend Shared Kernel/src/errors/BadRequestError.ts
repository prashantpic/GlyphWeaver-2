// src/errors/BadRequestError.ts
import { ApiError } from './ApiError';

export class BadRequestError extends ApiError {
  public readonly statusCode = 400;

  constructor(public message: string) {
    super(message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  public serializeErrors() {
    return [{ message: this.message }];
  }
}