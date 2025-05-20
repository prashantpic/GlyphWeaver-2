import { environment } from './environment';

/**
 * Prometheus metrics configuration.
 */
export const prometheusConfig = {
  // Default labels to apply to all metrics
  defaultLabels: {
    service_name: environment.ELASTIC_APM_SERVICE_NAME, // Using APM service name for consistency
    environment: environment.NODE_ENV,
  },
  // Add configuration for specific histograms or summaries if needed globally
  // requestDurationBuckets: [0.1, 0.5, 1, 5, 10] // Example
};