import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../../utils/errors';
import { TokenPayload, ITokenService } from '../../application/interfaces/token.service.interface';
import { AppConfig } from '../../config';
import jwt from 'jsonwebtoken';

// This is a concrete implementation needed for the middleware.
// In a larger system, this could be part of an infrastructure layer and injected,
// but for Express middleware, direct instantiation is a common and pragmatic approach.
class TokenServiceImpl implements ITokenService {
  generateTokens(payload: TokenPayload) {
    const accessToken = jwt.sign(payload, AppConfig.JWT_SECRET!, { expiresIn: AppConfig.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, AppConfig.REFRESH_TOKEN_SECRET!, { expiresIn: AppConfig.REFRESH_TOKEN_EXPIRES_IN });
    return Promise.resolve({ accessToken, refreshToken });
  }
  verifyAccessToken(token: string) {
    const payload = jwt.verify(token, AppConfig.JWT_SECRET!) as TokenPayload;
    return Promise.resolve(payload);
  }
  verifyRefreshToken(token: string) {
    const payload = jwt.verify(token, AppConfig.REFRESH_TOKEN_SECRET!) as TokenPayload;
    return Promise.resolve(payload);
  }
}
const tokenService: ITokenService = new TokenServiceImpl();

// Extend the Express Request type to include the user payload
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware to protect routes that require authentication.
 * It verifies the JWT from the Authorization header.
 *
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function.
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new UnauthorizedError('No token provided. Access denied.'));
  }

  try {
    const decoded = await tokenService.verifyAccessToken(token);
    req.user = decoded; // Attach user payload to the request object
    next();
  } catch (error) {
    return next(new UnauthorizedError('Invalid or expired token. Please log in again.'));
  }
};