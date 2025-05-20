import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config';
import { AnalyticsEvent } from '../../interfaces/common.interfaces';
import { TrackIAPEventInput } from '../../interfaces/iap.interfaces'; // IAP events are a common use case
import { ServiceUnavailableError, ActivityOperationFailedError } from '../../error_handling/custom_errors';

export class AnalyticsClient {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: config.services.analytics.endpoint, // Endpoint for REPO-ANALYTICS-MON or REPO-BACKEND-API analytics facade
      headers: {
        'Content-Type': 'application/json',
        // Authentication might be needed, e.g., an API key or a backend service token
        // 'X-Analytics-Key': config.services.analytics.apiKey, // Example
      },
      timeout: 10000, // 10 seconds timeout for analytics events
    });
  }

  // Generic trackEvent method
  public async trackEvent(event: AnalyticsEvent): Promise<void> {
    try {
      await this.httpClient.post('/track', event); // Assuming a generic /track endpoint
    } catch (error) {
      // Analytics errors are often logged but not rethrown to fail main workflows,
      // or have minimal retries. This behavior is usually configured in the activity.
      // Here, the client will throw an error, and the activity can decide how to handle it.
      this.handleApiError(error, 'trackEvent');
    }
  }

  // Specific method for IAP events if they have a dedicated structure / endpoint
  public async trackIapRelatedEvent(eventInput: TrackIAPEventInput): Promise<void> {
    // Transform TrackIAPEventInput to AnalyticsEvent or send as is if compatible
    const event: AnalyticsEvent = {
      name: eventInput.eventName,
      timestamp: new Date().toISOString(),
      userId: eventInput.playerId,
      properties: {
        transactionId: eventInput.transactionId,
        ...eventInput.eventData,
      },
    };
    await this.trackEvent(event);
  }


  private handleApiError(error: unknown, operationName: string): never {
     // Analytics errors are typically non-critical, so default nonRetryable to false.
     // The activity calling this can decide on retry strategy.
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      if (axiosError.response) {
        // Log and potentially throw a non-retryable error if it's a client error (4xx)
        // or a retryable one for server errors (5xx)
        console.warn(`AnalyticsClient.${operationName} API error: ${axiosError.response.status} - ${axiosError.response.data?.message || axiosError.message}`);
        throw ActivityOperationFailedError(
          `AnalyticsClient.${operationName} failed: ${axiosError.response.status}`,
          axiosError.response.status >= 400 && axiosError.response.status < 500, // 4xx non-retryable
          axiosError.response.data?.details
        );
      } else if (axiosError.request) {
        console.warn(`AnalyticsClient.${operationName} no response: ${axiosError.message}`);
        throw ServiceUnavailableError('AnalyticsService (no response)', axiosError);
      }
    }
    console.warn(`AnalyticsClient.${operationName} unknown error: ${String(error)}`);
    throw ServiceUnavailableError('AnalyticsService (unknown error)', error instanceof Error ? error : new Error(String(error)));
  }
}

export const analyticsClient = new AnalyticsClient();