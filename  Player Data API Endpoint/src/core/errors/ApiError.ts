/**
 * Custom error class for API-specific errors.
 * Allows for specifying an HTTP status code along with a message,
 * which can be used by the global error handler to send appropriate responses.
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  /**
   * Creates an instance of ApiError.
   * @param statusCode - The HTTP status code for the error.
   * @param message - The error message.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}