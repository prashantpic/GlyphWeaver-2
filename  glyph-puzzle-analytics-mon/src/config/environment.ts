import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

// Load environment variables from .env file in non-production environments
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const environmentSchema = z.object({
  PORT: z.preprocess(val => (val ? Number(val) : undefined), z.number().int().positive().default(3000)),
  NODE_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),

  // APM Config
  ELASTIC_APM_ACTIVE: z.preprocess((val) => val === 'true', z.boolean()).default(false),
  ELASTIC_APM_SERVICE_NAME: z.string().default('glyph-puzzle-analytics-mon'),
  ELASTIC_APM_SERVER_URL: z.string().url().optional(),
  ELASTIC_APM_SECRET_TOKEN: z.string().optional(),
  ELASTIC_APM_CLOUD_ID: z.string().optional(),
  ELASTIC_APM_API_KEY: z.string().optional(),

  // Analytics Ingestion Security
  ANALYTICS_API_KEY_HASH: z.string().min(1, { message: "ANALYTICS_API_KEY_HASH must be set." }),

  // Elasticsearch Config (Direct Ingestion)
  ELASTICSEARCH_NODE_URL: z.string().url().optional(),
  ELASTICSEARCH_USERNAME: z.string().optional(),
  ELASTICSEARCH_PASSWORD: z.string().optional(),
  ELASTICSEARCH_CLOUD_ID: z.string().optional(),
  ELASTICSEARCH_API_KEY: z.string().optional(),

  // Feature Flags
  ENABLE_DETAILED_TELEMETRY_LOGGING: z.preprocess((val) => val === 'true', z.boolean()).default(false),
  ENABLE_PROMETHEUS_HIGH_CARDINALITY_METRICS: z.preprocess((val) => val === 'true', z.boolean()).default(false),
  ENABLE_ELASTICSEARCH_DIRECT_INGESTION: z.preprocess((val) => val === 'true', z.boolean()).default(false),
});

// Validate environment variables
const envVars = environmentSchema.safeParse(process.env);

if (!envVars.success) {
  console.error('❌ Invalid environment variables:');
  envVars.error.issues.forEach((issue) => {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  });
  process.exit(1); // Exit if environment variables are invalid
}

/**
 * Typed application configuration derived from environment variables.
 */
export const environment = envVars.data;

/**
 * Check if the current environment is production.
 */
export const isProduction = environment.NODE_ENV === 'production';