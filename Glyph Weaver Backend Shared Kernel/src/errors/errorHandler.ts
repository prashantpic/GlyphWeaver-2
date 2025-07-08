// src/errors/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from './ApiError';
import { logger } from '../infrastructure/logging/Logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  logger.error('An unexpected error occurred', {
    error: {
      message: err.message,
      stack: err.stack,
    },
    request: {
      method: req.method,
      url: req.url,
    },
  });

  res.status(500).send({
    errors: [{ message: 'Something went wrong' }],
  });
};