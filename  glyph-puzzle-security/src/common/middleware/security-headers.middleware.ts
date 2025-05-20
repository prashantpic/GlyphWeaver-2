import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// REQ-SEC-001: This middleware contributes by enforcing secure header policies.
export const securityHeadersMiddleware = (): ((req: Request, res: Response, next: NextFunction) => void) => {
  return helmet({
    // Example: Configure Content Security Policy (CSP)
    // contentSecurityPolicy: {
    //   directives: {
    //     defaultSrc: ["'self'"],
    //     scriptSrc: ["'self'", "'unsafe-inline'"], // Be cautious with 'unsafe-inline'
    //     styleSrc: ["'self'", "'unsafe-inline'"],
    //     imgSrc: ["'self'", "data:"],
    //     connectSrc: ["'self'"],
    //     fontSrc: ["'self'"],
    //     objectSrc: ["'none'"],
    //     frameAncestors: ["'none'"], // Prevents clickjacking
    //     // reportUri: '/csp-violation-report-endpoint', // Endpoint to report CSP violations
    //   },
    // },
    // Example: Strict-Transport-Security (HSTS)
    // hsts: {
    //   maxAge: 31536000, // 1 year in seconds
    //   includeSubDomains: true,
    //   preload: true, // If you've submitted your domain to the HSTS preload list
    // },
    // Other helmet defaults are generally good.
    // Refer to helmet documentation for all options.
  });
};