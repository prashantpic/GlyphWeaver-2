import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../errors/ApiError';
import { config } from '../config';

// Augment the Express Request type to include the user payload
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; [key: string]: any };
    }
  }
}

/**
 * Express middleware to authenticate requests using a JSON Web Token (JWT).
 * It expects the token to be in the 'Authorization: Bearer <token>' header.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication token is required');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        throw new ApiError(401, 'Authentication token is malformed');
    }

    const decodedPayload = jwt.verify(token, config.jwtSecret);
    
    // Attach the decoded payload to the request object
    req.user = decodedPayload as { id: string };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      next(new ApiError(401, 'Invalid or expired token'));
    } else {
      next(error);
    }
  }
};