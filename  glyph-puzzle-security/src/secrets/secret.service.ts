import { KmsConfig } from '../config/kms.config';
import { SecretsConfig, SecretProviderType, KmsSecretProviderConfig, EnvSecretProviderConfig } from '../config/secrets.config';
import { KMS, SecretsManager } from 'aws-sdk'; // AWS SDK v2
// For AWS SDK v3:
// import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms";
// import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { logger } from '../common/utils/logger.util';

export interface ISecretProvider {
  getSecret(key: string): Promise<string | undefined>;
  type: SecretProviderType;
}

class EnvSecretProvider implements ISecretProvider {
  public readonly type = SecretProviderType.ENV;
  async getSecret(key: string): Promise<string | undefined> {
    return process.env[key];
  }
}

class KmsSecretProvider implements ISecretProvider {
  public readonly type = SecretProviderType.KMS;
  private kms: KMS;
  // private kmsClientV3: KMSClient; // For SDK v3

  constructor(kmsConfig: KmsConfig) {
    this.kms = new KMS({ // AWS SDK v2
        region: kmsConfig.region,
        accessKeyId: kmsConfig.accessKeyId, // Optional, SDK will use env/role if undefined
        secretAccessKey: kmsConfig.secretAccessKey, // Optional
    });
    // For SDK v3:
    // this.kmsClientV3 = new KMSClient({ region: kmsConfig.region });
  }

  async getSecret(key: string): Promise<string | undefined> {
    const encryptedValue = process.env[key];
    if (!encryptedValue) {
      return undefined;
    }

    try {
      // AWS SDK v2
      const decryptResponse = await this.kms.decrypt({ CiphertextBlob: Buffer.from(encryptedValue, 'base64') }).promise();
      if (decryptResponse.Plaintext) {
        return decryptResponse.Plaintext.toString('utf-8');
      }
      // For SDK v3:
      // const command = new DecryptCommand({ CiphertextBlob: Buffer.from(encryptedValue, 'base64') });
      // const decryptResponse = await this.kmsClientV3.send(command);
      // if (decryptResponse.Plaintext) {
      //   return Buffer.from(decryptResponse.Plaintext).toString('utf-8');
      // }
      logger.warn(`KMS Decryption: Plaintext not found for key ${key}`);
      return undefined;
    } catch (error) {
      logger.error(`KMS Decryption failed for key ${key}:`, error);
      return undefined;
    }
  }
}


export class SecretService {
  private providers: ISecretProvider[] = [];
  private cache: Map<string, string> = new Map();
  private isInitialized = false;

  constructor(
    private secretsConfig: SecretsConfig,
    // kmsConfig is needed if KmsSecretProvider is used
    // A more robust DI system would provide these configs
    private kmsConfig?: KmsConfig, 
    // Add other configs like awsSecretsManagerConfig if that provider is used
  ) {}

  // Initialization must be async if providers have async setup, or if we load them dynamically
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
        return;
    }

    for (const providerConfig of this.secretsConfig.providers) {
      switch (providerConfig.type) {
        case SecretProviderType.ENV:
          this.providers.push(new EnvSecretProvider());
          logger.info('SecretService: Initialized EnvSecretProvider.');
          break;
        case SecretProviderType.KMS:
          if (this.kmsConfig) {
            this.providers.push(new KmsSecretProvider(this.kmsConfig));
            logger.info('SecretService: Initialized KmsSecretProvider.');
          } else {
            logger.warn('SecretService: KmsSecretProvider configured but KmsConfig not provided. Skipping.');
          }
          break;
        // case SecretProviderType.AWS_SECRETS_MANAGER:
        //   // Implementation for AWS Secrets Manager provider
        //   logger.info('SecretService: Initialized AwsSecretsManagerProvider.');
        //   break;
        default:
          logger.warn(`SecretService: Unknown secret provider type: ${(providerConfig as any).type}`);
      }
    }
    this.isInitialized = true;
  }

  public async getSecret(key: string, defaultValue?: string): Promise<string | undefined> {
    if (!this.isInitialized) {
        logger.warn('SecretService not initialized. Call initialize() first. Falling back to process.env.');
        return process.env[key] ?? defaultValue;
    }
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    for (const provider of this.providers) {
      try {
        const value = await provider.getSecret(key);
        if (value !== undefined) {
          this.cache.set(key, value);
          return value;
        }
      } catch (error) {
        logger.error(`SecretService: Error fetching secret '${key}' from provider ${provider.type}:`, error);
      }
    }
    return defaultValue;
  }

  public async getRequiredSecret(key: string): Promise<string> {
    const value = await this.getSecret(key);
    if (value === undefined) {
      throw new Error(`Required secret '${key}' not found.`);
    }
    return value;
  }

  // Helper for config loading where synchronous access is fine for non-sensitive or already loaded env vars
  public getSecretSync(key: string, defaultValue?: string): string | undefined {
    // This sync version should primarily rely on EnvProvider or pre-cached values
    // For simplicity, it might just check process.env if SecretService isn't fully async initialized for config phase
    if (this.cache.has(key)) {
        return this.cache.get(key);
    }
    const valueFromEnv = process.env[key];
    if (valueFromEnv !== undefined) {
        if(!this.cache.has(key) && this.isInitialized) { // Cache if found and initialized
            this.cache.set(key, valueFromEnv);
        }
        return valueFromEnv;
    }
    return defaultValue;
  }

  public getRequiredSecretSync(key: string): string {
    const value = this.getSecretSync(key);
    if (value === undefined) {
      throw new Error(`Required synchronous secret '${key}' not found.`);
    }
    return value;
  }
}