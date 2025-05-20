import { HttpException } from './http-exception';

/**
 * Represents a single validation error detail.
 */
export interface ValidationErrorDetail {
    property: string; // The name of the property that failed validation
    value?: any; // The value that failed validation
    constraints?: { [type: string]: string }; // Constraints that failed (e.g., "isNotEmpty", "isEmail")
    children?: ValidationErrorDetail[]; // For nested validation errors
}

/**
 * Custom exception for input validation errors.
 * Typically results in a 400 Bad Request HTTP status code.
 * This exception can carry an array of detailed validation errors.
 */
export class ValidationException extends HttpException {
    public readonly errors: ValidationErrorDetail[];

    constructor(errors: ValidationErrorDetail[], message: string = 'Validation Failed') {
        super(400, message, errors); // Pass errors as details for HttpException
        this.name = 'ValidationException';
        this.errors = errors;
    }
}