import apmNode from 'elastic-apm-node';
import { apmConfig } from '../config/apm.config';
import { LoggingService } from './LoggingService';

/**
 * Service for managing the Elastic APM agent.
 */
export const ApmService = {
  /**
   * Initializes and starts the Elastic APM agent based on configuration.
   * This should be called as early as possible in the application lifecycle.
   */
  initialize: (): void => {
    if (apmConfig.active) {
      LoggingService.info('Initializing Elastic APM agent...');
      // Ensure APM is not started multiple times (e.g., in dev with hot-reloading)
      if (!apmNode.isStarted()) {
        apmNode.start(apmConfig); // Pass the entire config object
        LoggingService.info(`Elastic APM agent initialized for service: ${apmConfig.serviceName}, environment: ${apmConfig.environment}.`);

        // Optional: Listen for APM agent errors
        apmNode.on('error', (err) => {
            LoggingService.error('Elastic APM Agent Error:', err);
        });
        apmNode.on('request-error', (err) => {
            LoggingService.error('Elastic APM Agent Request Error (to APM Server):', err);
        });

      } else {
        LoggingService.warn('Elastic APM agent was already started.');
      }
    } else {
      LoggingService.info('Elastic APM agent is configured to be INACTIVE.');
    }
  },

  /**
   * Get the raw APM agent instance.
   * Use with caution; auto-instrumentation handles most cases.
   * @returns The APM agent instance or undefined if not active or not started.
   */
  getAgent: (): typeof apmNode | undefined => {
    return apmConfig.active && apmNode.isStarted() ? apmNode : undefined;
  },

  /**
   * Manually captures an error with APM.
   * @param error The error object to capture.
   * @param options Optional custom data for APM.
   */
  captureError: (error: Error | string, options?: apmNode.CaptureErrorOptions): void => {
      const agent = ApmService.getAgent();
      if (agent) {
          agent.captureError(error, options);
      } else {
          LoggingService.warn('APM agent not active, cannot capture error.', { error: error.toString() });
      }
  }
};