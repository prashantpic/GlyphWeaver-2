export interface IapPlatformConfig {
  validationUrl: string;
  sharedSecret?: string; // Apple specific
  bundleId?: string; // Apple/Google specific, if needed for validation context
  packageName?: string; // Google specific
  // For Google, service account key might be a path or the JSON string itself
  googleServiceAccountKeyJson?: string; 
}

export interface IapConfig {
  apple: IapPlatformConfig;
  google: IapPlatformConfig;
  timeoutMs: number;
}

// This function will be called by the main config index, passing SecretService's getSecret
export const iapConfig = (
  getSecret: (key: string, defaultValue?: string) => string | undefined,
): IapConfig => ({
  apple: {
    validationUrl: getSecret('IAP_APPLE_VALIDATION_URL', 'https://buy.itunes.apple.com/verifyReceipt') as string,
    // Sandbox URL: 'https://sandbox.itunes.apple.com/verifyReceipt'
    sharedSecret: getSecret('IAP_APPLE_SHARED_SECRET'),
    bundleId: getSecret('IAP_APPLE_BUNDLE_ID'),
  },
  google: {
    validationUrl: getSecret('IAP_GOOGLE_VALIDATION_URL', 
      // Example: https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{packageName}/purchases/products/{productId}/tokens/{token}
      // This URL is typically constructed dynamically. Store base part or complete template.
      'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/') as string,
    packageName: getSecret('IAP_GOOGLE_PACKAGE_NAME'),
    googleServiceAccountKeyJson: getSecret('IAP_GOOGLE_SERVICE_ACCOUNT_KEY_JSON'), // Store the JSON string itself or path to file
  },
  timeoutMs: parseInt(getSecret('IAP_VALIDATION_TIMEOUT_MS', '10000') || '10000', 10),
});