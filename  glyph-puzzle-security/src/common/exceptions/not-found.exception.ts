import { HttpException } from './http-exception';

/**
 * Custom exception for scenarios where a requested resource is not found.
 * Typically results in a 404 Not Found HTTP status code.
 * Use this when a lookup for a specific resource (e.g., by ID) yields no result.
 */
export class NotFoundException extends HttpException {
    constructor(message: string = 'Not Found', public readonly details?: any) {
        super(404, message, details);
        this.name = 'NotFoundException';
    }
}