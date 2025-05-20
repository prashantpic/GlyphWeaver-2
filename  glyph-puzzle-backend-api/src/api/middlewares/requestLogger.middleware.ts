import { Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger'; // Assuming logger.ts exists

export const requestLoggerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, url, ip, headers } = req;
  const userAgent = headers['user-agent'] || 'N/A';
  const userId = req.user?.id || 'anonymous'; // Assuming req.user might be populated by authMiddleware

  logger.info(
    `Incoming Request: ${method} ${url} - User: ${userId} - IP: ${ip} - UserAgent: ${userAgent}`
  );

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    logger.info(
      `Request Handled: ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms - User: ${userId}`
    );
  });

  res.on('close', () => {
    if (!res.writableFinished) { // If connection closed before response finished
        const duration = Date.now() - start;
        logger.warn(
            `Connection Closed Prematurely: ${method} ${url} - Duration: ${duration}ms - User: ${userId} - IP: ${ip}`
        );
    }
  });

  next();
};