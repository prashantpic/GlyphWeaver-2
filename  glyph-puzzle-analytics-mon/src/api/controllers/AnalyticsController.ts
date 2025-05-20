import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../../services/AnalyticsService';
import { AnalyticsIngestionPayload, AnalyticsEvent } from '../../types/analytics.types';
import { LoggingService } from '../../services/LoggingService';
import { MetricsService } from '../../services/MetricsService';

/**
 * Controller for handling analytics ingestion requests.
 * It validates payloads (via middleware), checks consent (via middleware),
 * and delegates processing to the AnalyticsService.
 */
export class AnalyticsController {
  /**
   * Handles incoming requests to ingest analytics events.
   * Assumes payload is already validated by `validator` middleware
   * and consent checked by `consentCheckMiddleware`.
   * @param req - Express request object.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  public async handleIngestEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    const payload: AnalyticsIngestionPayload = req.body; // Already validated

    // Ensure payload is always treated as an array for consistent processing
    const eventsToProcess: AnalyticsEvent[] = Array.isArray(payload) ? payload : [payload];

    LoggingService.http(`Processing ${eventsToProcess.length} events for ingestion.`, {
        requestId: req.requestId,
        userId: eventsToProcess[0]?.userId || 'N/A', // Log first event's userId if available
        sessionId: eventsToProcess[0]?.sessionId || 'N/A', // Log first event's sessionId if available
        consentStatus: req.userConsentStatus, // Log determined consent status from middleware
    });

    try {
      // Map events to include the server-determined consent status from the request object.
      // The AnalyticsService might use this for further logic or ensure it's part of the final event data.
      const eventsWithConsent = eventsToProcess.map(event => ({
        ...event,
        userConsentStatus: req.userConsentStatus || event.userConsentStatus || 'unknown', // Prioritize server-set status
      }));

      // Delegate processing to the AnalyticsService.
      // The service will handle forwarding to Elasticsearch or logging based on feature flags.
      await analyticsService.processEventBatch(eventsWithConsent);

      // The server accepts the request for processing.
      // 202 Accepted is suitable as processing might be asynchronous or deferred to the service.
      res.status(202).json({
        status: 'success',
        message: `Received ${eventsToProcess.length} analytics events for processing.`,
      });

    } catch (error) {
      LoggingService.error('Error during analytics event batch processing in controller:', error as Error, { requestId: req.requestId });
      // Pass the error to the global error handler
      next(error);
    }
  }
}

// Export an instance of the controller.
// Dependencies (like analyticsService, LoggingService, MetricsService) are imported directly as they are singletons/static objects.
export const analyticsController = new AnalyticsController();