import rateLimit from 'express-rate-limit';
import { environmentConfig } from '../../config';
import { logger } from '../../utils/logger'; // Assuming logger.ts exists
import { ApiError } from '../../utils/ApiError'; // Assuming ApiError.ts exists

export const globalRateLimiter = rateLimit({
  windowMs: environmentConfig.rateLimitWindowMs,
  max: environmentConfig.rateLimitMaxRequests,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests from this IP, please try again later.',
  },
  handler: (req, res, next, options) => {
    logger.warn(
      `Rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.originalUrl}. Limit: ${options.max} requests per ${options.windowMs}ms.`
    );
    // Use ApiError for consistent error response structure
    next(new ApiError(options.message.message, options.statusCode));
  },
  keyGenerator: (req) => {
    // Use IP address as the key for rate limiting
    // Consider using req.user.id if authenticated, for per-user limits on specific routes
    return req.ip || 'unknown-ip';
  },
});

// Example of a more stringent rate limiter for sensitive operations like login
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per `window` (here, 15 minutes)
    message: {
        status: 429,
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn(
          `Auth rate limit exceeded for IP: ${req.ip} on ${req.method} ${req.originalUrl}. Limit: ${options.max} requests per ${options.windowMs}ms.`
        );
        next(new ApiError(options.message.message, options.statusCode));
    },
    keyGenerator: (req) => req.ip || 'unknown-ip',
});