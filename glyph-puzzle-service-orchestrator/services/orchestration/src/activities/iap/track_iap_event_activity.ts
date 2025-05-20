import { ApplicationFailure, Context } from '@temporalio/activity';
import { AnalyticsClient } from '../../services/analytics_client'; // Placeholder
import { AnalyticsEvent } from '../../interfaces/common.interfaces'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  analyticsClient: AnalyticsClient;
}

interface TrackIapEventActivityInput {
  eventName: string; // e.g., 'IAP_Success', 'IAP_Failure_Validation', 'IAP_Failure_Grant'
  playerId: string;
  transactionId: string;
  productId?: string;
  eventDetails: Record<string, any>; // Flexible details
}

export async function trackIapEventActivity(
  input: TrackIapEventActivityInput
): Promise<void> {
  const { eventName, playerId, transactionId, productId, eventDetails } = input;
  const { analyticsClient, log } = Context.current<ActivityContext>();

  log.info('Track IAP event activity started', { eventName, playerId, transactionId });

  const event: AnalyticsEvent = {
    name: eventName,
    timestamp: new Date().toISOString(),
    userId: playerId,
    properties: {
      transactionId,
      productId,
      ...eventDetails,
    },
  };

  try {
    await analyticsClient.trackEvent(event);
    log.info('IAP event successfully tracked', { eventName, playerId, transactionId });
  } catch (error) {
    log.error('Error during IAP event tracking', { eventName, playerId, transactionId, error });
    // Tracking failures are often non-critical for the main flow, so might not throw ApplicationFailure
    // or throw one that is non-retryable or has limited retries.
    // For Saga, this activity typically does not have compensation.
    // If it *must* succeed, then throw:
    // throw ApplicationFailure.create({
    //   message: 'Failed to communicate with Analytics service',
    //   type: 'ServiceCommunicationError',
    //   cause: error as Error,
    //   nonRetryable: true, // Or false with limited retries
    // });
  }
}