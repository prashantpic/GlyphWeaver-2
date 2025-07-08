// src/errors/ApiError.ts
export abstract class ApiError extends Error {
  public abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public abstract serializeErrors(): { message: string; field?: string }[];
}