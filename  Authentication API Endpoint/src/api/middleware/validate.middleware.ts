import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ValidationError } from '../../utils/errors';

/**
 * A higher-order function that creates an Express middleware for validating
 * the request body against a given Joi schema.
 *
 * @param schema - The Joi schema to validate against.
 * @returns An Express middleware function.
 */
export const validate = (schema: Schema) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = schema.validate(req.body, {
    abortEarly: false, // Return all errors
    stripUnknown: true, // Remove unknown properties
  });

  if (error) {
    // Combine all validation error messages into a single string.
    const errorMessage = error.details
      .map((detail) => detail.message.replace(/['"]+/g, ''))
      .join('. ');
    return next(new ValidationError(errorMessage));
  }

  return next();
};