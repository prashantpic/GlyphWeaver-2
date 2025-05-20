import { Request, Response, NextFunction } from 'express';
import { LoggingService } from '../../services/LoggingService';
import { v4 as uuidv4 } from 'uuid'; // For generating request IDs
import { config } from '../../config';

/**
 * Middleware for logging incoming HTTP requests and their responses.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Assign a unique request ID if not already present
  req.requestId = req.requestId || uuidv4();
  res.setHeader('X-Request-Id', req.requestId); // Also send it back in response header

  const startHrTime = process.hrtime();

  // Log request start
  const requestLogMeta: any = {
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  };

  // Conditionally log body and headers based on environment
  // Be cautious with sensitive data and large payloads in production.
  if (config.environment.NODE_ENV !== 'production') {
    if (req.body && Object.keys(req.body).length > 0) requestLogMeta.body = req.body;
    requestLogMeta.headers = req.headers;
  }

  LoggingService.http(`--> ${req.method} ${req.originalUrl}`, requestLogMeta);

  res.on('finish', () => {
    const endHrTime = process.hrtime(startHrTime);
    const durationMs = (endHrTime[0] * 1000 + endHrTime[1] / 1e6).toFixed(3); // More precision

    // Log request end
    LoggingService.http(`<-- ${req.method} ${req.originalUrl}`, {
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: durationMs,
    });

    // Example: Observe request duration metric
    // MetricsService.observeIngestionRequestDuration(parseFloat(durationMs) / 1000, res.statusCode);
  });

  next();
};