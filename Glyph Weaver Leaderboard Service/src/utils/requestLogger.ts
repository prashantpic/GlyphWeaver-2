import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

/**
 * Express middleware for logging HTTP requests.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || '';
  
  res.on('finish', () => {
    const { statusCode } = res;
    const contentLength = res.get('content-length');
    
    logger.http(`${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`);
  });
  
  next();
};