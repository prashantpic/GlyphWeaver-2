import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface IConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  MONGODB_URI: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
}

const getSanitizedConfig = (env: NodeJS.ProcessEnv): IConfig => {
  const port = parseInt(env.PORT || '3001', 10);
  if (isNaN(port)) {
    throw new Error('PORT environment variable must be a number.');
  }

  const nodeEnv = env.NODE_ENV;
  if (