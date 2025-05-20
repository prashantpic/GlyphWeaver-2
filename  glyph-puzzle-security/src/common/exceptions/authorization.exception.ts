import { HttpException } from './http-exception';

/**
 * Custom exception for authorization failures.
 * Typically results in a 403 Forbidden HTTP status code.
 * Use this when an authenticated user attempts to access a resource or perform an action
 * for which they do not have sufficient permissions.
 */
export class AuthorizationException extends HttpException {
    constructor(message: string = 'Forbidden', public readonly details?: any) {
        super(403, message, details);
        this.name = 'AuthorizationException';
    }
}