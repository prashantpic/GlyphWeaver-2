import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Type-safe application configuration.
 */
const appConfig = {
  /**
   * The port the application will listen on.
   * @default 3001
   */
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3001,

  /**
   * The MongoDB connection string.
   */
  mongodbUri: process.env.MONGODB_URI || '',

  /**
   * The CORS origin policy.
   * @default '*'
   */
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

// Runtime validation for critical environment variables.
if (!appConfig.mongodbUri) {
  console.error('FATAL ERROR: MONGODB_URI is not defined in the environment.');
  throw new Error('MONGODB_URI must be provided.');
}

/**
 * A frozen, type-safe object providing all application configuration.
 * Freezing the object prevents accidental modification at runtime.
 */
export const config = Object.freeze(appConfig);