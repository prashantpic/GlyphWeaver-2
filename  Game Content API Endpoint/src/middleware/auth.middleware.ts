import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';

/**
 * Express middleware to authenticate requests using a JSON Web Token (JWT).
 * It checks for a 'Bearer' token in the 'Authorization' header, verifies it,
 * and attaches the decoded payload to the request object for use in downstream handlers.
 *
 * @param req The Express request object.
 * @param res The Express response object.
 * @param next The next middleware function in the chain.
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized: No token provided or malformed header.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Attach the decoded payload to the request object
    // Assuming the payload contains playerId
    req.user = decoded as { playerId: string };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized: Invalid or expired token.' });
  }
};