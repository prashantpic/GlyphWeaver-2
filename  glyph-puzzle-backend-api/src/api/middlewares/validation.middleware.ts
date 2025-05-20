import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiError } from '../../utils/ApiError'; // Assuming ApiError.ts exists
import { logger } from '../../utils/logger'; // Assuming logger.ts exists

type RequestDataSource = 'body' | 'query' | 'params';

export const validationMiddleware = (schema: Joi.Schema, source: RequestDataSource = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dataToValidate = req[source];
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Return all errors
        allowUnknown: false, // Disallow properties not in schema
        stripUnknown: true, // Remove unknown properties
      });

      if (error) {
        const validationErrors = error.details.map((detail) => ({
          message: detail.message.replace(/['"]/g, ''), // Clean up message
          path: detail.path.join('.'),
          type: detail.type,
        }));
        logger.warn(`Validation failed for ${req.method} ${req.originalUrl}:`, validationErrors);
        return next(new ApiError('Validation Error', 400, true, validationErrors));
      }

      // Replace the original data with the validated and potentially transformed data
      req[source] = value;
      next();
    } catch (err) {
      logger.error('Error in validation middleware:', err);
      next(new ApiError('An unexpected error occurred during validation', 500));
    }
  };
};