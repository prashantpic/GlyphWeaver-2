import { environment, isProduction } from './environment';
import { apmConfig } from './apm.config';
import { prometheusConfig } from './prometheus.config';
import { winstonConfig } from './winston.config';

/**
 * Aggregated application configuration.
 */
export const config = {
  environment,
  isProduction,
  apmConfig,
  prometheusConfig,
  winstonConfig,
  // Add other configurations here if needed
};