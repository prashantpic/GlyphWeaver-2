import rateLimit from 'express-rate-limit';
import config from '../config';

/**
 * Global rate limiting middleware.
 * Protects the API from brute-force attacks and abuse.
 */
export const rateLimitMiddleware = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});