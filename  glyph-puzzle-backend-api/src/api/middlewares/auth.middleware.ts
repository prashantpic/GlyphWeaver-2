import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/ApiError'; // Assuming ApiError.ts exists
import { logger } from '../../utils/logger'; // Assuming logger.ts exists
import jwt from 'jsonwebtoken'; // Using jsonwebtoken directly for this example
import { environmentConfig } from '../../config';

// This would typically come from a shared types definition or REPO-SECURITY
interface UserPayload {
  id: string;
  role: string; // e.g., 'player', 'admin'
  // other claims
}

// Placeholder for ISecurityService interaction
// In a real scenario, ISecurityService.verifyJwt would be used.
// For this example, we'll use jsonwebtoken directly.
const verifyJwtToken = async (token: string): Promise<UserPayload | null> => {
  try {
    const decoded = jwt.verify(token, environmentConfig.jwtSecret) as UserPayload;
    // Here you might add more checks, e.g., if the user still exists in DB, token not revoked, etc.
    // For now, just verifying the signature and structure.
    if (decoded && decoded.id && decoded.role) {
        return decoded;
    }
    return null;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
        logger.warn(`JWT token expired: ${error.message}`);
    } else if (error instanceof jwt.JsonWebTokenError) {
        logger.warn(`Invalid JWT token: ${error.message}`);
    } else {
        logger.error(`Error verifying JWT token: ${error}`);
    }
    return null;
  }
};


export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new ApiError('Authorization header is missing or malformed', 401));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new ApiError('Token not found in Authorization header', 401));
    }

    // In a real application, this would be:
    // const userPayload = await securityService.verifyJwt(token, 'access');
    // For now, using the direct JWT verification:
    const userPayload = await verifyJwtToken(token);


    if (!userPayload) {
      return next(new ApiError('Invalid or expired token', 401));
    }

    // Conceptual: Fetch full user details if needed, e.g., from IPlayerRepository
    // For now, we'll assume the payload is sufficient.
    // const user = await playerRepository.findById(userPayload.id);
    // if (!user || user.isDeleted) {
    //   return next(new ApiError('User not found or account deactivated', 401));
    // }

    req.user = userPayload as UserPayload; // Augment request object
    logger.info(`User authenticated: ${req.user.id}, Role: ${req.user.role}`);
    next();
  } catch (error) {
    logger.error('Authentication error in middleware:', error);
    next(new ApiError('Authentication failed', 401));
  }
};

export const adminAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // First, check for JWT-based admin
    if (req.user && req.user.role === 'admin') {
        logger.info(`Admin user ${req.user.id} authorized via JWT.`);
        return next();
    }

    // If not JWT admin, check for Admin API Key (for simpler admin tasks or system calls)
    const apiKey = req.headers['x-admin-api-key'] as string;

    if (apiKey && apiKey === environmentConfig.adminApiKey) {
        // Optionally, you can create a synthetic req.user for API key auth
        req.user = { id: 'admin_api_key_user', role: 'admin_apikey' };
        logger.info(`Admin action authorized via API Key.`);
        return next();
    }
    
    logger.warn(`Admin authorization failed for user: ${req.user?.id || 'unknown'}, IP: ${req.ip}`);
    return next(new ApiError('Forbidden: Administrator access required', 403));
};