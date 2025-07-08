import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * A type-safe configuration object for the application.
 * It loads environment variables and provides a fail-fast mechanism
 * if required variables are missing.
 */
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3001', 10),
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

  // Hashing
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),

  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',

  // SSL (for production)
  SSL_CERT_PATH: process.env.SSL_CERT_PATH,
  SSL_KEY_PATH: process.env.SSL_KEY_PATH,
};

// Fail-fast validation
if (!config.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined.');
}
if (!config.REFRESH_TOKEN_SECRET) {
  throw new Error('FATAL ERROR: REFRESH_TOKEN_SECRET is not defined.');
}
if (isNaN(config.PORT)) {
  throw new Error('FATAL ERROR: PORT is not a valid number.');
}

// The configuration object is frozen to prevent modifications at runtime.
export const AppConfig = Object.freeze(config);