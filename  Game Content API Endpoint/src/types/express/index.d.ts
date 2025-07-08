/**
 * Extends the Express Request interface to include a custom 'user' property.
 * This property will be attached by the authentication middleware and will
 * contain the decoded payload from the JSON Web Token (JWT).
 */
declare namespace Express {
  export interface Request {
    user?: {
      playerId: string;
      // You can add other properties from your JWT payload here
      // e.g., roles: string[];
    };
  }
}