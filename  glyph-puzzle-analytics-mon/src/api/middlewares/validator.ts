import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodArray, ZodUnion } from 'zod';
import { ValidationError as CustomValidationError } from '../../utils/customError'; // Renamed import
import { LoggingService } from '../../services/LoggingService';

type ValidatedRequestPart = 'body' | 'query' | 'params';

/**
 * Higher-order function that creates Express middleware for validating request parts using Zod schemas.
 * @param schema The Zod schema to validate against (AnyZodObject, ZodArray, or ZodUnion).
 * @param part The part of the request to validate ('body', 'query', or 'params'). Defaults to 'body'.
 * @returns Express middleware function.
 */
export const validate = (schema: AnyZodObject | ZodArray<AnyZodObject, "many"> | ZodUnion<[AnyZodObject, ...AnyZodObject[]] | [AnyZodObject]>, part: ValidatedRequestPart = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      LoggingService.debug(`Validating request ${part} against schema. RequestId: ${req.requestId}`);
      // Use .parse() which throws on failure
      const dataToValidate = req[part];
      // req[part] = schema.parse(dataToValidate); // This would replace the original data with parsed (e.g. default values)
      schema.parse(dataToValidate); // Just validate, don't replace for now, controller will cast
      LoggingService.debug(`Request ${part} validation successful. RequestId: ${req.requestId}`);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        LoggingService.warn(`Request ${part} validation failed. RequestId: ${req.requestId}`, { errors: error.errors });
        const errorDetails = error.errors.map(e => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code
        }));
        next(new CustomValidationError(`Request ${part} validation failed`, errorDetails));
      } else {
        LoggingService.error(`An unexpected error occurred during ${part} validation. RequestId: ${req.requestId}`, error as Error);
        next(error);
      }
    }
  };