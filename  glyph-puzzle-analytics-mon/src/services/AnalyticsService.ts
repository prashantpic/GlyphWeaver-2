import { AnalyticsEvent } from '../types/analytics.types';
import { LoggingService } from './LoggingService';
import { config } from '../config';
import { elasticsearchConnector, ElasticsearchConnector } from '../connectors/ElasticsearchConnector';
import { MetricsService } from './MetricsService';

/**
 * Service responsible for processing and forwarding analytics events.
 */
export class AnalyticsService {
  constructor(
    private logger: typeof LoggingService,
    private esConnector: ElasticsearchConnector, // Use the class type for dependency injection
    private metricsSvc: typeof MetricsService
  ) {}

  /**
   * Processes a batch of analytics events.
   * Performs server-side enrichment, logs metrics, and forwards events to ELK.
   * @param events - An array of validated analytics events.
   * @param requestMetadata - Metadata from the request, like user consent status.
   */
  public async processEventBatch(events: AnalyticsEvent[], requestMetadata: { userConsentStatus: 'granted' | 'denied' | 'unknown' }): Promise<void> {
    if (!events || events.length === 0) {
      this.logger.debug('processEventBatch called with no events.');
      return;
    }

    this.logger.info(`Processing batch of ${events.length} analytics events. Consent: ${requestMetadata.userConsentStatus}`);

    const processedEvents: AnalyticsEvent[] = [];

    for (const event of events) {
      try {
        // Server-side enrichment
        const enrichedEvent: AnalyticsEvent = {
          ...event,
          _ingestionTimestamp: new Date().toISOString(),
          // Add other server-side context if necessary, respecting privacy & consent
          // Example: _serviceVersion: config.environment.APP_VERSION (if you have it)
          userConsentStatus: requestMetadata.userConsentStatus, // Ensure it's part of the event for ES/logging
        };

        // Increment metrics (REQ-AMOT-005)
        // Consent status from requestMetadata is crucial for accurate metrics.
        this.metricsSvc.incrementIngestedEvents(enrichedEvent.eventName, requestMetadata.userConsentStatus);

        processedEvents.push(enrichedEvent);

      } catch (error) {
        this.logger.error(`Failed to process single event: ${event.eventName}`, { event, error });
        // Decide if a single failed event processing should stop the batch or continue
        // For now, continue with other events
      }
    }

    if (processedEvents.length === 0) {
        this.logger.warn('No events were successfully processed in the batch.');
        return;
    }

    // Forward processed events (REQ-AMOT-006 logging, potential direct ELK ingestion)
    if (config.environment.ENABLE_ELASTICSEARCH_DIRECT_INGESTION) {
      this.logger.debug(`Sending ${processedEvents.length} events to Elasticsearch.`);
      await this.esConnector.sendBulkEvents(processedEvents); // Method in ElasticsearchConnector
    } else {
      // Log events using Winston. Winston config (JSON format) prepares it for Filebeat/Logstash.
      this.logger.debug(`Logging ${processedEvents.length} events for log shipper (Filebeat/Logstash).`);
      processedEvents.forEach(pEvent => {
        // Winston JSON formatter will structure this for ELK
        this.logger.info('ANALYTICS_EVENT_LOGGED', { analyticsEvent: pEvent });
      });
    }

    this.logger.info(`Batch of ${processedEvents.length} events processed and forwarded.`);
  }
}

// Export an instance of the service with injected dependencies
export const analyticsService = new AnalyticsService(LoggingService, elasticsearchConnector, MetricsService);