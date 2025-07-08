import { AppError } from './app.error';

/**
 * Represents a 404 Not Found error.
 * Used when a requested resource does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'The requested resource was not found.') {
    super(message, 404);
  }
}