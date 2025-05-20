import { Request, Response, NextFunction, RequestHandler } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance, ClassConstructor } from 'class-transformer';
import { HttpException } from '../exceptions/http-exception';

// Define ValidationException as its file is not in the generation list
export class ValidationException extends HttpException {
  constructor(errors: ValidationError[]) {
    const message = 'Input data validation failed';
    const formattedErrors = errors.map(error => ({
      property: error.property,
      constraints: error.constraints,
      children: error.children?.map(child => ({ // Handle nested validation errors
          property: child.property,
          constraints: child.constraints,
      }))
    }));
    super(400, message, formattedErrors);
    Object.setPrototypeOf(this, ValidationException.prototype);
  }
}


export type RequestValidationTarget = 'body' | 'query' | 'params';

export function validationMiddleware<T extends object>(
  dtoClass: ClassConstructor<T>,
  target: RequestValidationTarget = 'body',
  skipMissingProperties = false,
  whitelist = true, // Remove properties not in DTO
  forbidNonWhitelisted = true, // Throw error if non-whitelisted properties are present
): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dataToValidate = req[target];

    if (!dataToValidate) {
      return next(new HttpException(400, `Request ${target} is missing for validation.`));
    }
    
    // Ensure dataToValidate is an object, as plainToInstance expects it.
    // Query parameters might be primitives if only one is sent.
    const objectToValidate = plainToInstance(dtoClass, dataToValidate, {
        enableImplicitConversion: true, // Allows conversion of string numbers/booleans from query/params
    });

    const errors: ValidationError[] = await validate(objectToValidate, {
      skipMissingProperties,
      whitelist,
      forbidNonWhitelisted,
      // groups: [], // For conditional validation using @ValidateIf or groups
      // always: true, // Validate even if no validation decorators are present
    });

    if (errors.length > 0) {
      next(new ValidationException(errors));
    } else {
      // Assign the validated (and possibly transformed) object back to the request
      req[target] = objectToValidate;
      next();
    }
  };
}