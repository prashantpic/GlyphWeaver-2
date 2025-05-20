import http from 'http';
import { createApp } from './app';
import { createServer, startServer } from './server';
import { loadAppConfig, AppConfig } from './config/app.config';
import { loadSecretsConfig, SecretsConfig } from './config/secrets.config';
import { SecretService } from './secrets/secret.service';
import { EnvSecretProvider } from './secrets/providers/env.provider';
import { KmsSecretProvider }_from_ './secrets/providers/kms.provider';
import { ISecretProvider } from './secrets/interfaces/secret-provider.interface';
import { loadKmsConfig, KmsConfig } from './config/kms.config';
import { loadAuditConfig, AuditConfig } from './config/audit.config';
import { AuditService } from './audit/audit.service';
import { logger } from './common/utils/logger.util';

// Export AuditService instance for global availability if needed, or use DI.
// This is a simple way for other modules to access the initialized instance.
// Consider a more robust DI mechanism for larger applications.
export let auditServiceInstance: AuditService;
export let secretServiceInstance: SecretService;

async function bootstrap() {
  logger.info('Starting application bootstrap process...');

  // 1. Load secrets configuration (defines providers)
  const secretsConf: SecretsConfig = loadSecretsConfig();
  logger.info(`Secret providers configured: ${secretsConf.providers.join(', ')}`);

  // 2. Initialize Secret Providers
  const secretProviders: ISecretProvider[] = [];
  if (secretsConf.providers.includes('env')) {
    secretProviders.push(new EnvSecretProvider());
    logger.info('EnvSecretProvider initialized.');
  }
  if (secretsConf.providers.includes('kms')) {
    // KmsSecretProvider's own config (e.g., region, unencrypted KMS key for bootstrapping)
    // is loaded directly from environment variables via loadKmsConfig.
    // This avoids a circular dependency on SecretService for its own provider's config.
    const kmsConfigForProvider: KmsConfig = loadKmsConfig(); // Assuming this loads basic KMS client settings
    if (kmsConfigForProvider.AWS_KMS_REGION) {
       // KmsSecretProvider requires aws-sdk to be configured for credentials (e.g. env vars, IAM role)
      secretProviders.push(new KmsSecretProvider(kmsConfigForProvider, logger));
      logger.info('KmsSecretProvider initialized.');
    } else {
      logger.warn('KMS provider was configured but AWS_KMS_REGION is missing. KmsSecretProvider not initialized.');
    }
  }

  // 3. Initialize SecretService
  secretServiceInstance = new SecretService(secretProviders, logger);
  logger.info('SecretService initialized.');

  // 4. Load application configurations using SecretService
  const appConfig: AppConfig = await loadAppConfig(secretServiceInstance);
  logger.info(`Application configuration loaded for environment: ${appConfig.NODE_ENV}`);

  const auditConfig: AuditConfig = await loadAuditConfig(secretServiceInstance);
  logger.info(`Audit configuration loaded. Log level: ${auditConfig.AUDIT_LOG_LEVEL}, Sink: ${auditConfig.AUDIT_LOG_SINK_TYPE}`);

  // 5. Initialize AuditService
  auditServiceInstance = new AuditService(auditConfig, logger);
  logger.info('AuditService initialized.');

  // 6. Create Express application
  const app = createApp(appConfig, auditServiceInstance); // Pass auditService if app setup needs it directly
  logger.info('Express application created.');

  // 7. Create HTTP server
  const server: http.Server = createServer(app);
  logger.info('HTTP server created.');

  // 8. Start the server
  await startServer(server, appConfig, logger);

  // Graceful shutdown
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];
  signals.forEach((signal) => {
    process.on(signal, async () => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        // Add any other cleanup logic here (e.g., close database connections)
        process.exit(0);
      });

      // Force shutdown if server doesn't close in time
      setTimeout(() => {
        logger.error('Graceful shutdown timed out, forcing exit.');
        process.exit(1);
      }, 10000); // 10 seconds timeout
    });
  });
}

bootstrap().catch((error) => {
  logger.error('Unhandled error during bootstrap:', error);
  process.exit(1);
});