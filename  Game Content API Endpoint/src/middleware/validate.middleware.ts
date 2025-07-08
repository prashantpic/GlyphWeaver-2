import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

/**
 * Creates a generic Express middleware for validating the request body against a Joi schema.
 * This is a higher-order function that takes a schema and returns a middleware handler.
 *
 * @param schema The Joi schema to validate the request body against.
 * @returns An Express middleware function.
 */
export const validate = (schema: Schema) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate the request body. `abortEarly: false` would report all errors at once.
    await schema.validateAsync(req.body);
    next();
  } catch (error: any) {
    // If validation fails, Joi throws an error.
    res.status(400).json({
      message: 'Bad Request: Validation failed.',
      details: error.details.map((d: any) => d.message),
    });
  }
};