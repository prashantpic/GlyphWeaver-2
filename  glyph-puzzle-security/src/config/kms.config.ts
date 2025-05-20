export interface KmsConfig {
  region: string;
  defaultKeyId: string;
  accessKeyId?: string; // Optional: if not using IAM roles/instance profiles
  secretAccessKey?: string; // Optional: if not using IAM roles/instance profiles
}

// This function will be called by the main config index, passing SecretService's getSecret
export const kmsConfig = (
  getSecret: (key: string, defaultValue?: string) => string | undefined,
): KmsConfig => ({
  region: getSecret('AWS_KMS_REGION', 'us-east-1') as string,
  defaultKeyId: getSecret('AWS_KMS_DEFAULT_KEY_ID', 'alias/aws/secretsmanager') as string, // Example, ensure this key exists
  accessKeyId: getSecret('AWS_ACCESS_KEY_ID'), // Typically handled by SDK environment variables or IAM roles
  secretAccessKey: getSecret('AWS_SECRET_ACCESS_KEY'), // Typically handled by SDK environment variables or IAM roles
});