import { RetryPolicy } from '@temporalio/common';

/**
 * Default retry policy for most activities.
 * Exponential backoff, reasonable number of attempts.
 */
export const DefaultActivityRetryPolicy: RetryPolicy = {
  initialInterval: '1s',
  backoffCoefficient: 2,
  maximumInterval: '30s', // Max interval between retries
  maximumAttempts: 5, // Max number of attempts
  // nonRetryableErrorTypes: [], // Specify error types that should not be retried
};

/**
 * Retry policy for critical activities like audit logging or final state changes.
 * More attempts, potentially longer intervals if appropriate.
 */
export const CriticalActivityRetryPolicy: RetryPolicy = {
  initialInterval: '2s',
  backoffCoefficient: 2,
  maximumInterval: '1m', // Max interval between retries
  maximumAttempts: 10, // More attempts for critical operations
  // nonRetryableErrorTypes: [],
};

/**
 * Retry policy for IAP validation activity.
 * Might have fewer retries or shorter intervals as platform validation services
 * are usually quick, and repeated failures might indicate a persistent issue with the receipt.
 */
export const IAPValidationActivityRetryPolicy: RetryPolicy = {
  initialInterval: '500ms',
  backoffCoefficient: 1.5,
  maximumInterval: '10s',
  maximumAttempts: 3,
  // nonRetryableErrorTypes: ['IAPValidationFailedError'], // If thrown by the activity itself for terminal validation failures
};

/**
 * Retry policy for non-critical, fire-and-forget style activities (e.g., some analytics).
 */
export const NonCriticalActivityRetryPolicy: RetryPolicy = {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '5s',
    maximumAttempts: 2,
};


// Helper function to classify errors (example - more sophisticated logic can be added)
// This is more for use *within* an activity if it needs to decide whether to rethrow
// as retryable or non-retryable ApplicationFailure. Workflows mostly rely on what activities throw.
export function isRetryableError(error: Error): boolean {
  if (error.name === 'ServiceUnavailableError') { // Assuming custom error type
    return true;
  }
  // Add more conditions based on error types or messages
  // For example, check for specific HTTP status codes if the error object contains them
  // if (error.httpStatusCode && error.httpStatusCode >= 500) {
  //   return true;
  // }
  return false; // Default to non-retryable if not specified
}