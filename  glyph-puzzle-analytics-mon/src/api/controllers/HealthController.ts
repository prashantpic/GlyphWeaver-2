import { Request, Response } from 'express';
import { LoggingService } from '../../services/LoggingService';
import { config } from '../../config';
import { elasticsearchConnector } from '../../connectors/ElasticsearchConnector';

/**
 * Controller for handling application health check requests.
 * Provides liveness and readiness probes.
 */
export class HealthController {
  /**
   * Handles liveness probe requests.
   * Simply indicates if the server process is running and responsive.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  public checkLiveness = (req: Request, res: Response): void => {
    LoggingService.debug('Liveness probe received.', { requestId: req.requestId });
    res.status(200).json({ status: 'ok', message: 'Service is alive.' });
  };

  /**
   * Handles readiness probe requests.
   * Checks if the application is ready to handle requests, including critical dependencies.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  public checkReadiness = async (req: Request, res: Response): Promise<void> => {
    LoggingService.debug('Readiness probe received.', { requestId: req.requestId });
    try {
      // Check critical dependencies if necessary.
      // Example: Check Elasticsearch connection IF direct ingestion is enabled and connector is initialized.
      if (config.environment.ENABLE_ELASTICSEARCH_DIRECT_INGESTION && elasticsearchConnector.isConnectorInitialized()) {
        const esHealthy = await elasticsearchConnector.pingCluster();
        if (!esHealthy) {
          LoggingService.warn('Readiness check failed: Elasticsearch ping unsuccessful.', { requestId: req.requestId });
          res.status(503).json({ status: 'error', message: 'Service is not ready - Cannot connect to Elasticsearch.' });
          return;
        }
        LoggingService.debug('Elasticsearch connection healthy for readiness check.', { requestId: req.requestId });
      }

      // If all checks pass, the service is ready.
      res.status(200).json({ status: 'ok', message: 'Service is ready.' });
    } catch (error) {
      LoggingService.error('Error during readiness check:', error as Error, { requestId: req.requestId });
      res.status(503).json({ status: 'error', message: 'Service is not ready - An internal error occurred during readiness check.' });
    }
  };
}

// Export an instance of the controller.
// Dependencies (like LoggingService) are imported directly.
export const healthController = new HealthController();