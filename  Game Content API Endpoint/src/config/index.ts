import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Interface for application configuration.
 */
interface IAppConfig {
  PORT: number;
  MONGODB_URI: string;
  JWT_SECRET: string;
}

const requiredConfig: (keyof IAppConfig)[] = ['PORT', 'MONGODB_URI', 'JWT_SECRET'];

const config: IAppConfig = {
  PORT: Number(process.env.PORT) || 3000,
  MONGODB_URI: process.env.MONGODB_URI as string,
  JWT_SECRET: process.env.JWT_SECRET as string,
};

// Validate that all required environment variables are set
for (const key of requiredConfig) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// Freeze the configuration object to prevent modifications
export default Object.freeze(config);