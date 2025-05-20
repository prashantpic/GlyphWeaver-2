import client, { Registry, Counter, Histogram } from 'prom-client';
import { prometheusConfig } from '../config/prometheus.config';
import { LoggingService } from './LoggingService';
import { config } from '../config';

/**
 * Prometheus metrics service.
 * Manages metric registration and provides methods to interact with metrics.
 */
class MetricsManager {
  private registry: Registry;
  private analyticsEventsIngestedTotal: Counter<string>;
  private analyticsIngestionRequestDurationSeconds: Histogram<string>;
  private elasticsearchIngestionTotal: Counter<string>;

  constructor() {
    this.registry = new client.Registry();
    this.registry.setDefaultLabels(prometheusConfig.defaultLabels);

    // Collect default Node.js process metrics
    client.collectDefaultMetrics({ register: this.registry });
    LoggingService.info('Default Prometheus metrics collected.');

    // Define custom metrics
    this.analyticsEventsIngestedTotal = new client.Counter({
      name: 'analytics_events_ingested_total',
      help: 'Total number of analytics events ingested, labeled by event name and consent status.',
      labelNames: ['event_name', 'consent_status'], // REQ-AMOT-001
      registers: [this.registry],
    });

    this.analyticsIngestionRequestDurationSeconds = new client.Histogram({
      name: 'analytics_ingestion_request_duration_seconds',
      help: 'Duration of analytics ingestion HTTP requests in seconds.',
      labelNames: ['status_code', 'method'], // Add method for more detail
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // Custom buckets
      registers: [this.registry],
    });

    this.elasticsearchIngestionTotal = new client.Counter({
        name: 'elasticsearch_ingestion_total',
        help: 'Total number of analytics events attempted to send to Elasticsearch, labeled by status.',
        labelNames: ['status'], // 'success', 'failure'
        registers: [this.registry],
    });

    LoggingService.info('Custom Prometheus metrics initialized.');
  }

  /**
   * Gets the Prometheus registry instance.
   */
  public getRegistry(): Registry {
    return this.registry;
  }

  /**
   * Increments the counter for ingested analytics events.
   * @param eventName - The name of the ingested event.
   * @param consentStatus - The consent status ('granted', 'denied', 'unknown').
   */
  public incrementIngestedEvents(eventName: string, consentStatus: string): void {
    try {
      // Conditionally use high cardinality event_name label
      const finalEventName = config.environment.ENABLE_PROMETHEUS_HIGH_CARDINALITY_METRICS ? eventName : 'all_events';
      this.analyticsEventsIngestedTotal.inc({ event_name: finalEventName, consent_status: consentStatus });
    } catch (error) {
      LoggingService.error('Failed to increment analytics_events_ingested_total metric', { error });
    }
  }

  /**
   * Observes the duration of an analytics ingestion request.
   * @param durationSeconds - The duration in seconds.
   * @param statusCode - The HTTP status code of the response.
   * @param method - The HTTP method of the request.
   */
  public observeIngestionRequestDuration(durationSeconds: number, statusCode: number, method: string): void {
    try {
      this.analyticsIngestionRequestDurationSeconds.observe({ status_code: statusCode.toString(), method }, durationSeconds);
    } catch (error) {
      LoggingService.error('Failed to observe analytics_ingestion_request_duration_seconds metric', { error });
    }
  }

  /**
   * Increments the counter for Elasticsearch ingestion attempts.
   * @param status - 'success' or 'failure'.
   */
  public incrementElasticsearchIngestion(status: 'success' | 'failure'): void {
     try {
        this.elasticsearchIngestionTotal.inc({ status });
     } catch (error) {
        LoggingService.error('Failed to increment elasticsearch_ingestion_total metric', { error });
     }
  }
}

// Export a singleton instance of the MetricsManager
export const MetricsService = new MetricsManager();