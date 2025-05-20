import http from 'http';
import https from 'https';
import fs from 'fs';
import { Application } from 'express';
import { AppConfig } from './config/app.config';
import { Logger } from './common/utils/logger.util'; // Assuming Logger type is exported or use any

export function createServer(app: Application, appConfig?: AppConfig): http.Server | https.Server {
  // REQ-SEC-001: Capable of handling HTTPS.
  // For production, TLS is often terminated at a load balancer.
  // For local development, HTTPS can be enabled here if certs are provided.
  if (appConfig?.HTTPS_ENABLED && appConfig.HTTPS_KEY_PATH && appConfig.HTTPS_CERT_PATH) {
    try {
      const privateKey = fs.readFileSync(appConfig.HTTPS_KEY_PATH, 'utf8');
      const certificate = fs.readFileSync(appConfig.HTTPS_CERT_PATH, 'utf8');
      const credentials = { key: privateKey, cert: certificate };
      return https.createServer(credentials, app);
    } catch (error) {
      const loggerInstance = (app as any).logger || console; // Try to get a logger or fallback
      loggerInstance.error('Failed to create HTTPS server, falling back to HTTP. Error:', error);
      return http.createServer(app);
    }
  }
  return http.createServer(app);
}

export function startServer(
  server: http.Server | https.Server,
  config: AppConfig,
  logger: Logger,
): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen(config.PORT, config.HOST, () => {
      const address = server.address();
      let serverType = 'HTTP';
      if (server instanceof https.Server) {
          serverType = 'HTTPS';
      }
      if (typeof address === 'string') {
        logger.info(`${serverType} server listening on ${address}`);
      } else if (address) {
        logger.info(`${serverType} server listening on ${address.address}:${address.port}`);
      }
      resolve();
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.syscall !== 'listen') {
        logger.error('Server error:', error);
        reject(error);
        return;
      }

      const bind = typeof config.PORT === 'string' ? `Pipe ${config.PORT}` : `Port ${config.PORT}`;
      switch (error.code) {
        case 'EACCES':
          logger.error(`${bind} requires elevated privileges`);
          reject(error);
          process.exit(1); // eslint-disable-line no-process-exit
          break;
        case 'EADDRINUSE':
          logger.error(`${bind} is already in use`);
          reject(error);
          process.exit(1); // eslint-disable-line no-process-exit
          break;
        default:
          logger.error('Server error:', error);
          reject(error);
      }
    });
  });
}