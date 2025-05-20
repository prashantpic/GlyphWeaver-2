export enum SecretProviderType {
  ENV = 'env',
  KMS = 'kms', // For decrypting specific environment variables that are KMS-encrypted ciphertexts
  AWS_SECRETS_MANAGER = 'aws_secrets_manager', // If you were to implement this provider
}

export interface BaseSecretProviderConfig {
  type: SecretProviderType;
  priority?: number; // Lower numbers have higher priority
}

export interface EnvSecretProviderConfig extends BaseSecretProviderConfig {
  type: SecretProviderType.ENV;
}

export interface KmsSecretProviderConfig extends BaseSecretProviderConfig {
  type: SecretProviderType.KMS;
  // KMS config (region, keyId) might be taken from global kms.config.ts or specified here
  // For simplicity, SecretService could use the global KmsConfig
  // Or you could define specific keys to decrypt:
  // encryptedKeys: string[]; // e.g., ['DB_PASSWORD_ENCRYPTED']
}

export type ConcreteSecretProviderConfig = EnvSecretProviderConfig | KmsSecretProviderConfig;

export interface SecretsConfig {
  providers: ConcreteSecretProviderConfig[];
}

// This function will be called by the main config index.
// It does NOT use SecretService itself, as it's configuring SecretService.
// These values should come directly from non-sensitive environment variables.
export const secretsConfig = (): SecretsConfig => {
  const providerConfigs: ConcreteSecretProviderConfig[] = [];

  // Example: Configure providers based on an environment variable
  // PROVIDERS_CONFIG_JSON='[{"type": "env", "priority": 1}, {"type": "kms", "priority": 0}]'
  const providersConfigJson = process.env.SECRET_PROVIDERS_CONFIG_JSON;

  if (providersConfigJson) {
    try {
      const parsedProviders = JSON.parse(providersConfigJson);
      if (Array.isArray(parsedProviders)) {
        // Add basic validation if needed
        providerConfigs.push(...parsedProviders);
      }
    } catch (error) {
      console.error('Failed to parse SECRET_PROVIDERS_CONFIG_JSON. Using default providers.', error);
    }
  }

  // Default to EnvProvider if nothing is configured
  if (providerConfigs.length === 0) {
    providerConfigs.push({ type: SecretProviderType.ENV, priority: 0 });
  }
  
  // Sort by priority (lower number = higher priority)
  providerConfigs.sort((a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity));

  return {
    providers: providerConfigs,
  };
};