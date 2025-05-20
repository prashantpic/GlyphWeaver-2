import { LogLevel } from '../common/utils/logger.util';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  apiPrefix: string;
  logLevel: LogLevel;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  bcryptSaltRounds: number;
}

export const appConfig = (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api/v1',
  logLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || (15 * 60 * 1000).toString(), 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per 15 minutes
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
});