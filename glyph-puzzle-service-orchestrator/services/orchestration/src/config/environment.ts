import Joi from 'joi';

interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  TEMPORAL_ADDRESS: string;
  TEMPORAL_NAMESPACE: string;
  TEMPORAL_CLIENT_CERT_PATH?: string;
  TEMPORAL_CLIENT_KEY_PATH?: string;
  IAP_VALIDATION_SERVICE_ENDPOINT: string;
  BACKEND_API_ENDPOINT: string;
  ANALYTICS_SERVICE_ENDPOINT: string;
  IAP_VALIDATION_SERVICE_API_KEY: string;
  BACKEND_API_AUTH_TOKEN: string;
  IAP_PROCESSING_TASK_QUEUE: string;
  SCORE_SUBMISSION_TASK_QUEUE: string;
}

const envVarsSchema = Joi.object<EnvironmentVariables, true>({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  LOG_LEVEL: Joi.string()
    .valid('debug', 'info', 'warn', 'error')
    .default('info'),
  TEMPORAL_ADDRESS: Joi.string().required(),
  TEMPORAL_NAMESPACE: Joi.string().default('default'),
  TEMPORAL_CLIENT_CERT_PATH: Joi.string().optional(),
  TEMPORAL_CLIENT_KEY_PATH: Joi.string().optional(),
  IAP_VALIDATION_SERVICE_ENDPOINT: Joi.string().uri().required(),
  BACKEND_API_ENDPOINT: Joi.string().uri().required(),
  ANALYTICS_SERVICE_ENDPOINT: Joi.string().uri().required(),
  IAP_VALIDATION_SERVICE_API_KEY: Joi.string().required(),
  BACKEND_API_AUTH_TOKEN: Joi.string().required(),
  IAP_PROCESSING_TASK_QUEUE: Joi.string().default('iap-processing-task-queue'),
  SCORE_SUBMISSION_TASK_QUEUE: Joi.string().default('score-submission-task-queue'),
}).unknown(true); // Allow other environment variables

const { error, value: envVars } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config: EnvironmentVariables = envVars;