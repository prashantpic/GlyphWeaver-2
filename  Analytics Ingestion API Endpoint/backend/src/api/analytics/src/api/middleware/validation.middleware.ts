import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * A higher-order function that creates a reusable Express middleware for request body validation.
 * @param schema The Joi schema to validate the request body against.
 * @returns An Express middleware function.
 */
export const validateRequest = (schema: Joi.ObjectSchema) => 
  (req: Request, res: Response, next: NextFunction) => {
    // Validate the request body against the provided schema.
    const { error } = schema.validate(req.body, {
      abortEarly: false, // Report all errors, not just the first one
      stripUnknown: true, // Remove unknown keys from the validated object
    });

    if (error) {
      // If validation fails, create a structured error object.
      // This makes the error more consumable for clients and logging systems.
      const errorMessage = `Validation failed: ${error.details.map(d => d.message).join(', ')}`;
      const validationError = new Error(errorMessage);
      
      // Attach a status code to the error object.
      // The global error handler will use this to send the appropriate HTTP response.
      (validationError as any).statusCode = 400; // Bad Request

      // Pass the error to the next middleware (the global error handler).
      return next(validationError);
    }

    // If validation succeeds, proceed to the next middleware in the chain (the controller).
    next();
};