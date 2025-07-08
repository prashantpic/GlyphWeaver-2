import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates and provides application configuration from environment variables.
 */
const appConfig = {
  port: process.env.PORT || '3000',
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
};

// Validate essential configuration
if (!appConfig.mongodbUri) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in the environment.");
  process.exit(1);
}

if (!appConfig.jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in the environment.");
  process.exit(1);
}

/**
 * A frozen, strongly-typed configuration object.
 */
export const config = Object.freeze(appConfig);