import { AppConfig, appConfig as loadAppConfig } from './app.config';
import { JwtConfig, jwtConfig as loadJwtConfig } from './jwt.config';
import { OAuthConfig, oauthConfig as loadOAuthConfig } from './oauth.config';
import { IapConfig, iapConfig as loadIapConfig } from './iap.config';
import { KmsConfig, kmsConfig as loadKmsConfig } from './kms.config';
import { AuditConfig, auditConfig as loadAuditConfig } from './audit.config';
import { SecretsConfig, secretsConfig as loadSecretsConfig } from './secrets.config';
import { SecretService } from '../secrets/secret.service';

export interface AllConfig {
  app: AppConfig;
  jwt: JwtConfig;
  oauth: OAuthConfig;
  iap: IapConfig;
  kms: KmsConfig;
  audit: AuditConfig;
  secrets: SecretsConfig; // Config for the secret service itself
}

// This is a simplified setup. In a real app, SecretService might be initialized
// earlier and passed around, or a global instance might be used.
// For this structure, we initialize it here to load other configs.

const baseSecretsConfig = loadSecretsConfig(); // Load SecretService's own config first (from plain env vars)
const baseKmsConfig = loadKmsConfig((key, defaultValue) => process.env[key] ?? defaultValue); // KMS config might be needed by SecretService's KmsProvider

const secretServiceInstance = new SecretService(baseSecretsConfig, baseKmsConfig);

// It's ideal to await initialize, but top-level await might not be available
// depending on module system or if this runs very early.
// For now, we'll assume synchronous parts of SecretService are sufficient for config loading,
// or that initialize is called in the main app bootstrap.
// A common pattern is to have an async `initConfig()` function.
// For now, we use getSecretSync for initial config bootstrap.
// Or, make this whole config object a Promise<AllConfig> or provide an async factory.

const getSecretSyncWrapper = (key: string, defaultValue?: string): string | undefined => {
  return secretServiceInstance.getSecretSync(key, defaultValue);
}

const config: AllConfig = {
  app: loadAppConfig(), // AppConfig typically from plain env vars or sync secret access
  jwt: loadJwtConfig(getSecretSyncWrapper),
  oauth: loadOAuthConfig(getSecretSyncWrapper),
  iap: loadIapConfig(getSecretSyncWrapper),
  kms: baseKmsConfig, // Already loaded, might be refined if it also had secrets
  audit: loadAuditConfig(getSecretSyncWrapper),
  secrets: baseSecretsConfig,
};

// Function to fully initialize SecretService, to be called during app startup
export async function initializeSecretService() {
  await secretServiceInstance.initialize();
}

export { secretServiceInstance as secretService };
export default config;