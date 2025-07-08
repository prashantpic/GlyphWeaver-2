import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface AppConfig {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  CORS_ORIGIN: string;
  PLAYER_SERVICE_URL: string;
  LEADERBOARD_SERVICE_URL: string;
  DOWNSTREAM_SERVICES: { name: string; url: string }[];
}

const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const config: Readonly<AppConfig> = {
  NODE_ENV: getRequiredEnv('NODE_ENV'),
  PORT: parseInt(getRequiredEnv('PORT'), 10),
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  JWT_SECRET: getRequiredEnv('JWT_SECRET'),
  CORS_ORIGIN: getRequiredEnv('CORS_ORIGIN'),
  PLAYER_SERVICE_URL: getRequiredEnv('PLAYER_SERVICE_URL'),
  LEADERBOARD_SERVICE_URL: getRequiredEnv('LEADERBOARD_SERVICE_URL'),
  DOWNSTREAM_SERVICES: [
    {
        name: 'PlayerService',
        url: `${getRequiredEnv('PLAYER_SERVICE_URL')}/health`,
    },
    {
        name: 'LeaderboardService',
        url: `${getRequiredEnv('LEADERBOARD_SERVICE_URL')}/health`,
    }
    // Add other downstream services here as they are created
  ],
};

export default Object.freeze(config);