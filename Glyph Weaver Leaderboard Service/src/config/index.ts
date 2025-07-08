import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

/**
 * Defines the schema for environment variables using Zod.
 * This ensures that all required variables are present and correctly typed at startup.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  CLIENT_SECRET: z.string().min(1, 'CLIENT_SECRET is a required environment variable'),
  CORS_ORIGIN: z.string().url(),
});

/**
 * Validates the current environment variables against the defined schema.
 * If validation fails, the process will exit with an error, preventing the application
 * from running with an invalid configuration.
 */
const validatedEnv = envSchema.safeParse(process.env);

if (!validatedEnv.success) {
  console.error(
    '❌ Invalid environment variables:',
    validatedEnv.error.flatten().fieldErrors,
  );
  throw new Error('Invalid environment variables.');
}

/**
 * The validated and frozen configuration object.
 * This object is exported and used throughout the application as a single source of truth for configuration.
 */
export const config = Object.freeze(validatedEnv.data);