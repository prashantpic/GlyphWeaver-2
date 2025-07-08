import proxy from 'express-http-proxy';
import { RequestHandler, Request } from 'express';
import logger from '../utils/logger';

/**
 * Factory function that creates a proxy middleware for a specific downstream service.
 * It forwards the request and enhances it with user context if available.
 *
 * @param targetUrl The base URL of the downstream microservice.
 * @returns An Express RequestHandler that proxies requests.
 */
export const createProxy = (targetUrl: string): RequestHandler => {
  return proxy(targetUrl, {
    /**
     * Resolves the path to be forwarded to the target service.
     * We use `req.originalUrl` to ensure the entire path, including any
     * query parameters, is forwarded correctly.
     * e.g., A request to `/gateway/player/profile?id=123` is proxied to
     * `/target/player/profile?id=123`.
     */
    proxyReqPathResolver: (req: Request) => {
      return req.originalUrl;
    },

    /**
     * Decorator to modify the proxy request options before it's sent.
     * This is used to forward user context from the auth middleware
     * to the downstream services via a custom header.
     */
    proxyReqOptDecorator: async (proxyReqOpts, srcReq) => {
      if (srcReq.user) {
        if(proxyReqOpts.headers) {
            proxyReqOpts.headers['x-user-context'] = JSON.stringify(srcReq.user);
            logger.debug(`Forwarding request with user context for user ID: ${srcReq.user.sub}`);
        }
      }
      return proxyReqOpts;
    },

    /**
     * Custom error handler for the proxy.
     */
    proxyErrorHandler: (err, res, next) => {
        logger.error(`Proxy Error: ${err.message}`, { code: err.code, target: targetUrl });
        switch (err.code) {
            case 'ECONNREFUSED':
                return res.status(503).json({ message: 'Service Unavailable' });
            case 'ETIMEDOUT':
                return res.status(504).json({ message: 'Gateway Timeout' });
            default:
                next(err);
        }
    }
  });
};