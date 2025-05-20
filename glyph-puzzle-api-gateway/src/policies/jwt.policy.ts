import { Policy } from 'express-gateway';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { ErrorResponseDto } from '../dto/error-response.dto';

interface JwtAuthPolicyActionParams {
  secretOrPublicKey: string;
  issuer?: string | string[];
  audience?: string | string[];
  requiredRoles?: string[];
}

const policy: Policy = {
  name: 'jwtAuthPolicy',
  policy: (actionParams: JwtAuthPolicyActionParams) => {
    return (req: any, res: any, next: (err?: any) => void) => {
      const authHeader = req.headers['authorization'];

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        const errorResponse: ErrorResponseDto = {
          statusCode: 401,
          message: 'Authorization header missing or malformed.',
          timestamp: new Date().toISOString(),
          path: req.path,
          errorCode: 'AUTH_HEADER_INVALID',
        };
        return res.status(401).json(errorResponse);
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        const errorResponse: ErrorResponseDto = {
          statusCode: 401,
          message: 'Authentication token missing.',
          timestamp: new Date().toISOString(),
          path: req.path,
          errorCode: 'TOKEN_MISSING',
        };
        return res.status(401).json(errorResponse);
      }

      try {
        const decoded = jwt.verify(token, actionParams.secretOrPublicKey, {
          issuer: actionParams.issuer,
          audience: actionParams.audience,
          algorithms: ['HS256', 'RS256'], // Specify supported algorithms
        }) as JwtPayload;

        // Attach user information to egContext
        // Ensure Express.Request is augmented via a .d.ts file for type safety
        req.egContext.user = {
          userId: decoded.sub || decoded.id, // 'sub' is standard, 'id' might be custom
          roles: decoded.roles || [], // Assuming roles are an array in the token
          ...decoded, // Include all decoded claims
        };

        // Optional: Check for required roles
        if (actionParams.requiredRoles && actionParams.requiredRoles.length > 0) {
          const userRoles: string[] = (req.egContext.user?.roles as string[]) || [];
          const hasRequiredRole = actionParams.requiredRoles.some(role => userRoles.includes(role));
          if (!hasRequiredRole) {
            const errorResponse: ErrorResponseDto = {
              statusCode: 403,
              message: 'Insufficient permissions.',
              timestamp: new Date().toISOString(),
              path: req.path,
              errorCode: 'INSUFFICIENT_PERMISSIONS',
            };
            return res.status(403).json(errorResponse);
          }
        }

        next();
      } catch (err: any) {
        let message = 'Invalid or expired authentication token.';
        let errorCode = 'TOKEN_INVALID_OR_EXPIRED';
        if (err.name === 'TokenExpiredError') {
          message = 'Authentication token has expired.';
          errorCode = 'TOKEN_EXPIRED';
        } else if (err.name === 'JsonWebTokenError') {
          message = 'Authentication token is invalid.';
          errorCode = 'TOKEN_INVALID';
        } else if (err.name === 'NotBeforeError') {
            message = 'Authentication token not yet active.';
            errorCode = 'TOKEN_NOT_YET_ACTIVE';
        }

        const errorResponse: ErrorResponseDto = {
          statusCode: 401,
          message,
          timestamp: new Date().toISOString(),
          path: req.path,
          errorCode,
          details: process.env.NODE_ENV !== 'production' ? { errorName: err.name, errorMessage: err.message } : undefined,
        };
        return res.status(401).json(errorResponse);
      }
    };
  },
  schema: {
    $id: 'http://express-gateway.io/schemas/policies/jwtAuthPolicy.json',
    type: 'object',
    properties: {
      secretOrPublicKey: {
        type: 'string',
        description: 'The secret (for HMAC) or public key (for RSA/ECDSA) used to verify the JWT signature.',
      },
      issuer: {
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        description: 'Optional. The expected issuer claim value(s).',
      },
      audience: {
        oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
        description: 'Optional. The expected audience claim value(s).',
      },
      requiredRoles: {
        type: 'array',
        items: { type: 'string' },
        description: 'Optional. A list of roles, one of which the user must possess (from token claims).',
      },
    },
    required: ['secretOrPublicKey'],
  },
};

module.exports = policy;