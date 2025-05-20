export interface JwtConfig {
  secretOrPrivateKey: string; // For HMAC
  secretOrPublicKey: string; // For RSA/ES verify
  accessTokenExpirationTime: string; // e.g., '15m', '1h'
  refreshTokenExpirationTime: string; // e.g., '7d'
  issuer: string;
  audience: string;
  algorithm: string; // e.g. HS256, RS256
}

// This function will be called by the main config index, passing SecretService's getSecret
export const jwtConfig = (
  getSecret: (key: string, defaultValue?: string) => string | undefined,
): JwtConfig => ({
  secretOrPrivateKey: getSecret('JWT_SECRET_OR_PRIVATE_KEY', 'default-super-secret-key-for-dev-only') as string, // Fallback for dev, MUST be set in prod
  secretOrPublicKey: getSecret('JWT_SECRET_OR_PUBLIC_KEY', 'default-super-secret-key-for-dev-only') as string, // Fallback for dev, MUST be set in prod
  accessTokenExpirationTime: getSecret('JWT_ACCESS_TOKEN_EXPIRATION_TIME', '15m') as string,
  refreshTokenExpirationTime: getSecret('JWT_REFRESH_TOKEN_EXPIRATION_TIME', '7d') as string,
  issuer: getSecret('JWT_ISSUER', 'glyph-puzzle-api') as string,
  audience: getSecret('JWT_AUDIENCE', 'glyph-puzzle-clients') as string,
  algorithm: getSecret('JWT_ALGORITHM', 'HS256') as string,
});