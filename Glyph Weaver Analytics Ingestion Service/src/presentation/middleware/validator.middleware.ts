import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { logger } from '../../utils/logger';

/**
 * Creates an Express middleware for validating request data (body, query, params)
 * against a provided Zod schema.
 *
 * @param {AnyZodObject} schema - The Zod schema to validate against.
 * @returns {Function} An Express middleware handler.
 */
export const validateRequest = (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn({ errors: error.flatten() }, 'Request validation failed');
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      // Pass other errors to the global error handler
      return next(error);
    }
  };