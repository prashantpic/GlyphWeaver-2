export interface OAuthProviderConfig {
  clientId: string;
  clientSecret: string;
  callbackURL: string;
  scope: string[];
}

export interface AppleOAuthProviderConfig {
  clientID: string; // Bundle ID
  teamID: string;
  keyID: string;
  privateKey: string; // The content of the .p8 file
  callbackURL: string;
  scope: string[];
}

export interface OAuthConfig {
  google: OAuthProviderConfig;
  apple: AppleOAuthProviderConfig;
}

// This function will be called by the main config index, passing SecretService's getSecret
export const oauthConfig = (
  getSecret: (key: string, defaultValue?: string) => string | undefined,
): OAuthConfig => ({
  google: {
    clientId: getSecret('GOOGLE_CLIENT_ID', 'your-google-client-id') as string,
    clientSecret: getSecret('GOOGLE_CLIENT_SECRET', 'your-google-client-secret') as string,
    callbackURL: getSecret('GOOGLE_CALLBACK_URL', '/api/v1/auth/google/callback') as string,
    scope: ['profile', 'email'],
  },
  apple: {
    clientID: getSecret('APPLE_CLIENT_ID', 'com.example.app') as string, // Usually your app's bundle ID
    teamID: getSecret('APPLE_TEAM_ID', 'YOUR_APPLE_TEAM_ID') as string,
    keyID: getSecret('APPLE_KEY_ID', 'YOUR_APPLE_KEY_ID') as string,
    privateKey: getSecret('APPLE_PRIVATE_KEY', 'YOUR_APPLE_PRIVATE_KEY_CONTENT_HERE_OR_FROM_SECRET_MANAGER') as string, // Store the full key content
    callbackURL: getSecret('APPLE_CALLBACK_URL', '/api/v1/auth/apple/callback') as string,
    scope: ['name', 'email'],
  },
});