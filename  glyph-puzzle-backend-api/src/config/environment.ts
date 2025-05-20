import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const environmentSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  MONGODB_URI: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRY: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: Joi.string().default('7d'),
  CORS_ALLOWED_ORIGINS: Joi.string().required(),
  ADMIN_API_KEY: Joi.string().required(),
  APPLE_IAP_VALIDATION_URL: Joi.string().uri().required(),
  GOOGLE_IAP_VALIDATION_URL: Joi.string().uri().required(),
  ANALYTICS_PIPELINE_ENDPOINT: Joi.string().uri().required(),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: Joi.number().default(100),
}).unknown(true); // Allow other environment variables not defined in the schema

const { error, value: envVars } = environmentSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export interface EnvironmentConfig {
  nodeEnv: string;
  port: number;
  mongodbUri: string;
  redisUrl: string;
  jwtSecret: string;
  jwtAccessTokenExpiry: string;
  jwtRefreshTokenExpiry: string;
  corsAllowedOrigins: string[];
  adminApiKey: string;
  appleIapValidationUrl: string;
  googleIapValidationUrl: string;
  analyticsPipelineEndpoint: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

export const environmentConfig: EnvironmentConfig = {
  nodeEnv: envVars.NODE_ENV,
  port: envVars.PORT,
  mongodbUri: envVars.MONGODB_URI,
  redisUrl: envVars.REDIS_URL,
  jwtSecret: envVars.JWT_SECRET,
  jwtAccessTokenExpiry: envVars.JWT_ACCESS_TOKEN_EXPIRY,
  jwtRefreshTokenExpiry: envVars.JWT_REFRESH_TOKEN_EXPIRY,
  corsAllowedOrigins: envVars.CORS_ALLOWED_ORIGINS.split(','),
  adminApiKey: envVars.ADMIN_API_KEY,
  appleIapValidationUrl: envVars.APPLE_IAP_VALIDATION_URL,
  googleIapValidationUrl: envVars.GOOGLE_IAP_VALIDATION_URL,
  analyticsPipelineEndpoint: envVars.ANALYTICS_PIPELINE_ENDPOINT,
  rateLimitWindowMs: envVars.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: envVars.RATE_LIMIT_MAX_REQUESTS,
};

export default environmentConfig;