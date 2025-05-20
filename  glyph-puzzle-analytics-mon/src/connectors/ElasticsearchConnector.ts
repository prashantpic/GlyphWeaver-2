import { Client, ClientOptions, errors as EsErrors } from '@elastic/elasticsearch';
import { config } from '../config';
import { LoggingService } from '../services/LoggingService';
import { AnalyticsEvent } from '../types/analytics.types';
import { MetricsService } from '../services/MetricsService';

/**
 * Connector for sending data directly to an Elasticsearch cluster.
 * Manages client initialization, bulk event sending, and connection health checks.
 */
export class ElasticsearchConnector {
  private client: Client | undefined;
  private initialized = false;

  /**
   * Initializes the Elasticsearch client based on environment configuration.
   * This method should be called once during application startup.
   */
  public initialize(): void {
    if (this.initialized) {
      LoggingService.warn('ElasticsearchConnector already initialized.');
      return;
    }

    const {
      ENABLE_ELASTICSEARCH_DIRECT_INGESTION,
      ELASTICSEARCH_NODE_URL,
      ELASTICSEARCH_CLOUD_ID,
      ELASTICSEARCH_USERNAME,
      ELASTICSEARCH_PASSWORD,
      ELASTICSEARCH_API_KEY,
    } = config.environment;

    if (!ENABLE_ELASTICSEARCH_DIRECT_INGESTION) {
      LoggingService.info('Elasticsearch direct ingestion is disabled via feature flag.');
      return;
    }

    const clientOptions: ClientOptions = {
        // Consider adding node.ssl options for self-signed certs in dev/test if needed
        // requestTimeout: 30000, // Example: 30 seconds
    };

    if (ELASTICSEARCH_CLOUD_ID) {
      clientOptions.cloud = { id: ELASTICSEARCH_CLOUD_ID };
      if (ELASTICSEARCH_API_KEY) {
        clientOptions.auth = { apiKey: ELASTICSEARCH_API_KEY };
      } else if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
        clientOptions.auth = { username: ELASTICSEARCH_USERNAME, password: ELASTICSEARCH_PASSWORD };
      } else {
        LoggingService.error('Elasticsearch Cloud ID specified, but no API key or username/password provided. Connector not initialized.');
        return;
      }
    } else if (ELASTICSEARCH_NODE_URL) {
      clientOptions.node = ELASTICSEARCH_NODE_URL;
      if (ELASTICSEARCH_API_KEY) {
        clientOptions.auth = { apiKey: ELASTICSEARCH_API_KEY };
      } else if (ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD) {
        clientOptions.auth = { username: ELASTICSEARCH_USERNAME, password: ELASTICSEARCH_PASSWORD };
      }
      // Note: Node URL can be used without auth, but this is generally not recommended for production.
    } else {
      LoggingService.error('Elasticsearch direct ingestion enabled, but no Node URL or Cloud ID specified. Connector not initialized.');
      return;
    }

    try {
      this.client = new Client(clientOptions);
      this.initialized = true;
      LoggingService.info('ElasticsearchConnector initialized successfully.');

      // Optional: Ping the cluster to verify connection immediately after initialization.
      this.pingCluster().then(isHealthy => {
        if (isHealthy) {
          LoggingService.info('Elasticsearch initial ping successful.');
        } else {
          LoggingService.warn('Elasticsearch initial ping failed. Check connection and configuration.');
        }
      });

    } catch (error) {
      LoggingService.error('Failed to initialize ElasticsearchConnector:', error as Error);
      this.initialized = false;
    }
  }

  /**
   * Checks if the Elasticsearch connector has been initialized.
   * @returns True if initialized, false otherwise.
   */
  public isConnectorInitialized(): boolean {
      return this.initialized && !!this.client;
  }

  /**
   * Sends a batch of analytics events to Elasticsearch using the bulk API.
   * Each event is indexed into an index name derived from the event name and date.
   * @param events - An array of processed analytics events.
   */
  public async sendBulkEvents(events: AnalyticsEvent[]): Promise<void> {
    if (!this.isConnectorInitialized() || !this.client) {
      LoggingService.warn('ElasticsearchConnector is not initialized. Cannot send events.');
      events.forEach(() => MetricsService.incrementElasticsearchIngestion('failure')); // Count as failure if not sent
      return;
    }

    if (!events || events.length === 0) {
      LoggingService.debug('No events to send to Elasticsearch in this batch.');
      return;
    }

    const operations = events.flatMap(event => {
      try {
        const eventDate = new Date(event.timestamp); // Assumes timestamp is a valid ISO string
        // Sanitize eventName for index: lowercase, replace non-alphanumeric (except _) with hyphen
        const sanitizedEventName = event.eventName.toLowerCase().replace(/[^a-z0-9_]+/g, '-').replace(/-$/, '');
        const dateSuffix = eventDate.toISOString().slice(0, 10).replace(/-/g, '.'); // YYYY.MM.DD
        const indexName = `analytics-events-${sanitizedEventName}-${dateSuffix}`;

        return [{ index: { _index: indexName } }, event];
      } catch (e) {
        LoggingService.error('Failed to prepare event for Elasticsearch bulk operation:', { eventId: event.userId, eventName: event.eventName, error: e});
        MetricsService.incrementElasticsearchIngestion('failure');
        return []; // Skip this event
      }
    });

    if (operations.length === 0) {
        LoggingService.warn('No valid operations to send to Elasticsearch after event preparation.');
        return;
    }


    try {
      const response = await this.client.bulk({ operations });
      let successfulIngestions = 0;
      let failedIngestions = 0;

      if (response.errors) {
        LoggingService.warn('Elasticsearch bulk ingestion reported errors for some items.');
        response.items.forEach(item => {
          if (item.index && item.index.error) {
            failedIngestions++;
            LoggingService.error('Elasticsearch bulk item error:', {
              index: item.index._index,
              itemId: item.index._id,
              errorType: item.index.error.type,
              reason: item.index.error.reason,
            });
          } else if (item.index && item.index.status >= 200 && item.index.status < 300) {
            successfulIngestions++;
          } else {
            // Catch-all for other non-error but non-success scenarios or unexpected item structures
            failedIngestions++;
          }
        });
      } else {
        successfulIngestions = events.length; // All items successful if response.errors is false
      }

      if (successfulIngestions > 0) {
        LoggingService.info(`Successfully sent ${successfulIngestions} events to Elasticsearch.`);
        for (let i = 0; i < successfulIngestions; i++) MetricsService.incrementElasticsearchIngestion('success');
      }
      if (failedIngestions > 0) {
        LoggingService.error(`Failed to send ${failedIngestions} events to Elasticsearch.`);
        for (let i = 0; i < failedIngestions; i++) MetricsService.incrementElasticsearchIngestion('failure');
      }

    } catch (error) {
      const errorCount = events.length; // Assume all failed if bulk call itself fails
      LoggingService.error('Error during Elasticsearch bulk send operation:', error as Error);
      for (let i = 0; i < errorCount; i++) MetricsService.incrementElasticsearchIngestion('failure');
    }
  }

  /**
   * Pings the Elasticsearch cluster to check its health and connectivity.
   * @returns True if the ping is successful, false otherwise.
   */
  public async pingCluster(): Promise<boolean> {
    if (!this.isConnectorInitialized() || !this.client) {
      LoggingService.warn('Cannot ping Elasticsearch: Connector not initialized.');
      return false;
    }
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      if (error instanceof EsErrors.ConnectionError) {
        LoggingService.error('Elasticsearch ping failed: Connection Error.', error);
      } else if (error instanceof EsErrors.AuthenticationException) {
        LoggingService.error('Elasticsearch ping failed: Authentication Exception.', error);
      } else if (error instanceof EsErrors.AuthorizationException) {
        LoggingService.error('Elasticsearch ping failed: Authorization Exception.', error);
      } else {
        LoggingService.error('Elasticsearch ping failed with an unexpected error:', error as Error);
      }
      return false;
    }
  }

  /**
   * Closes the Elasticsearch client connection.
   * Should be called during graceful shutdown of the application.
   */
  public async close(): Promise<void> {
    if (this.client) {
      try {
        await this.client.close();
        LoggingService.info('Elasticsearch client connection closed.');
      } catch (error) {
        LoggingService.error('Error closing Elasticsearch client connection:', error as Error);
      } finally {
        this.client = undefined;
        this.initialized = false;
      }
    }
  }
}

// Export a singleton instance to be used globally within the application.
export const elasticsearchConnector = new ElasticsearchConnector();