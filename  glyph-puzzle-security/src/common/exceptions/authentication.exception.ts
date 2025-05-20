import { HttpException } from './http-exception';

/**
 * Custom exception for authentication failures.
 * Typically results in a 401 Unauthorized HTTP status code.
 * Use this when a user's identity cannot be verified (e.g., invalid credentials,
 * missing/invalid token, expired token).
 */
export class AuthenticationException extends HttpException {
    constructor(message: string = 'Unauthorized', public readonly details?: any) {
        super(401, message, details);
        this.name = 'AuthenticationException';
    }
}