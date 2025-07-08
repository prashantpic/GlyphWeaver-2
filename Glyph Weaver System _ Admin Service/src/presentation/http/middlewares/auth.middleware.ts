import { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import config from '../../../config';

/**
 * @file Provides middleware functions for securing API routes, handling JWT validation and role-based authorization for administrative access.
 * @namespace GlyphWeaver.Backend.System.Presentation.HTTP.Middlewares
 */

interface JwtPayload {
  userId: string;
  roles: string[];
  iat: number;
  exp: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

/**
 * Middleware to authenticate requests by validating a JWT.
 * It checks for a 'Bearer' token in the Authorization header, verifies it,
 * and attaches the decoded payload to `req.user`.
 *
 * @param req The authenticated request object.
 * @param res The response object.
 * @param next The next middleware function.
 */
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid token.' });
  }
};

/**
 * Middleware factory for role-based authorization.
 * Returns an Express RequestHandler that checks if the authenticated user's roles
 * include at least one of the required roles.
 *
 * @param requiredRoles An array of role strings. Access is granted if the user has any of these roles.
 * @returns An Express RequestHandler.
 */
export const authorize = (requiredRoles: string[]): RequestHandler => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles;

    if (!userRoles) {
      res.status(403).json({ message: 'Forbidden: No roles associated with user.' });
      return;
    }

    const hasRequiredRole = userRoles.some(role => requiredRoles.includes(role));

    if (hasRequiredRole) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden: Insufficient permissions.' });
    }
  };
};