import { Request, Response, NextFunction } from 'express';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';
import config from '../config';
import logger from '../utils/logger';

// Extend Express Request type to include the user payload
declare global {
  namespace Express {
    export interface Request {
      user?: JWTPayload;
    }
  }
}

// Cache the JWKSet to avoid fetching it on every request
let jwks: ReturnType<typeof createRemoteJWKSet>;

/**
 * Middleware to verify JWT token from the Authorization header.
 * It fetches a JSON Web Key Set (JWKS) from the configured URL,
 * verifies the token signature and expiration, and attaches the
 * decoded payload to the request object (`req.user`).
 *
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next middleware function.
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication token is required' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(config.jwt.jwksUrl));
    }

    const { payload } = await jwtVerify(token, jwks, {
      // Add expected issuer or audience here if needed
      // issuer: 'urn:example:issuer',
      // audience: 'urn:example:audience',
    });

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof Error) {
        logger.warn(`JWT Verification Failed: ${error.message}`);
    } else {
        logger.warn('An unknown JWT verification error occurred');
    }
    res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
  }
};