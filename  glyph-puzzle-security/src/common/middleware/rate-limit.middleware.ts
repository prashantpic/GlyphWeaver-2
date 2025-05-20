import rateLimit from 'express-rate-limit';
import { AppConfig } from '../../config/app.config'; // Assuming rate limit config is in AppConfig

export const rateLimitMiddleware = (appConfig: AppConfig) => {
  return rateLimit({
    windowMs: appConfig.rateLimitWindowMs, // e.g., 15 * 60 * 1000 for 15 minutes
    max: appConfig.rateLimitMaxRequests,   // Limit each IP to X requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    message: {
      status: 429,
      message: 'Too many requests, please try again later.',
    },
    // keyGenerator: (req, res) => req.ip, // Default, uses req.ip
    // handler: (req, res, next, options) => { // Custom handler
    //   res.status(options.statusCode).send(options.message);
    // }
  });
};