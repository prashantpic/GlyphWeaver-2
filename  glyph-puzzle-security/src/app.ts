import express, { Application, Router } from 'express';
import passport from 'passport';
import helmet from 'helmet'; // Used by SecurityHeadersMiddleware or directly
import { AppConfig } from './config/app.config';
import { AuditService } from './audit/audit.service';
import { authRouter } from './auth/auth.routes';
import { iapRouter } from './iap/iap.routes';
import { initializePassport } from './auth/passport.setup';
import { errorMiddleware } from './common/middleware/error.middleware';
import { securityHeadersMiddleware } from './common/middleware/security-headers.middleware';
import { rateLimitMiddleware } from './common/middleware/rate-limit.middleware';
import { logger } from './common/utils/logger.util'; // General application logger

export function createApp(appConfig: AppConfig, auditService: AuditService): Application {
  const app: Application = express();

  // Core Middleware
  // Use helmet for security headers via the dedicated middleware as per spec
  app.use(securityHeadersMiddleware()); // REQ-SEC-001
  app.use(express.json({ limit: appConfig.BODY_LIMIT_SIZE || '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: appConfig.BODY_LIMIT_SIZE || '10mb' }));

  // Rate Limiting
  // rateLimitMiddleware will be configured internally using its own config file or appConfig
  app.use(rateLimitMiddleware());

  // Passport Initialization
  // initializePassport might depend on services like TokenService, UserService, AuditService
  // These services should be available for import within passport.setup.ts
  // or passed to initializePassport if they are not singletons.
  // For simplicity, assuming passport.setup.ts handles its own dependencies.
  initializePassport(passport, auditService); // Pass auditService if strategies need it directly
  app.use(passport.initialize());

  // API Routes
  const apiRouter: Router = express.Router();
  apiRouter.use('/auth', authRouter);
  apiRouter.use('/iap', iapRouter);
  // Add other module routers here, e.g. /cryptography if it has routes

  app.use(appConfig.API_PREFIX, apiRouter);

  // Health check endpoint (optional, but good practice)
  app.get(`${appConfig.API_PREFIX}/health`, (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });
  
  // Not Found Handler (if no routes matched) - should be before errorMiddleware
  app.use((req, res, next) => {
    res.status(404).json({ message: 'Not Found' });
  });

  // Global Error Handling Middleware
  // errorMiddleware should be the last middleware added.
  // It uses the general application logger, not AuditService directly for general errors.
  app.use(errorMiddleware(logger));

  return app;
}