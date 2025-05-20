import { environment } from './environment';
import { AgentConfigOptions } from 'elastic-apm-node';

/**
 * Elastic APM agent configuration.
 */
export const apmConfig: AgentConfigOptions = {
  serviceName: environment.ELASTIC_APM_SERVICE_NAME,
  serverUrl: environment.ELASTIC_APM_SERVER_URL,
  secretToken: environment.ELASTIC_APM_SECRET_TOKEN,
  cloudId: environment.ELASTIC_APM_CLOUD_ID,
  apiKey: environment.ELASTIC_APM_API_KEY,
  environment: environment.NODE_ENV,
  active: environment.ELASTIC_APM_ACTIVE,
  logLevel: environment.LOG_LEVEL as AgentConfigOptions['logLevel'], // APM agent logger level
  // Add other APM specific configurations here as needed
  // Example: transactionSampleRate: 0.1,
};