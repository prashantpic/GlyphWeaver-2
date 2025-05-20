import { ApplicationFailure } from '@temporalio/common'; // Using ApplicationFailure from common

/**
 * Creates a custom ApplicationFailure for IAP validation failures.
 * These are typically non-retryable from the workflow's perspective once validation definitively fails.
 * @param message Error message
 * @param details Additional details
 * @returns ApplicationFailure instance
 */
export const IAPValidationFailedError = (message: string, details?: unknown[]): ApplicationFailure =>
  ApplicationFailure.create({
    type: 'IAPValidationFailedError',
    message,
    nonRetryable: true,
    details,
  });

/**
 * Creates a custom ApplicationFailure for score integrity validation failures.
 * Non-retryable.
 * @param message Error message
 * @param details Additional details
 * @returns ApplicationFailure instance
 */
export const ScoreIntegrityError = (message: string, details?: unknown[]): ApplicationFailure =>
  ApplicationFailure.create({
    type: 'ScoreIntegrityError',
    message,
    nonRetryable: true,
    details,
  });

/**
 * Creates a custom ApplicationFailure when cheat detection flags a score.
 * Non-retryable.
 * @param message Error message
 * @param details Additional details (e.g., cheat reason, confidence)
 * @returns ApplicationFailure instance
 */
export const CheatDetectedError = (message: string, details?: unknown[]): ApplicationFailure =>
  ApplicationFailure.create({
    type: 'CheatDetectedError',
    message,
    nonRetryable: true,
    details,
  });

/**
 * Creates a custom ApplicationFailure for when a dependent service is unavailable.
 * Typically retryable.
 * @param serviceName Name of the unavailable service
 * @param originalError Optional original error object
 * @returns ApplicationFailure instance
 */
export const ServiceUnavailableError = (serviceName: string, originalError?: Error): ApplicationFailure =>
  ApplicationFailure.create({
    type: 'ServiceUnavailableError',
    message: `${serviceName} is unavailable.`,
    nonRetryable: false, // Service unavailability is usually temporary and thus retryable
    details: originalError ? [originalError.name, originalError.message, originalError.stack] : undefined,
  });

/**
 * Creates a custom ApplicationFailure for when a compensation operation fails.
 * These are critical and usually non-retryable, requiring manual intervention.
 * @param compensatedActivityName Name of the activity whose compensation failed
 * @param originalError Optional original error object
 * @returns ApplicationFailure instance
 */
export const CompensationFailedError = (compensatedActivityName: string, originalError?: Error): ApplicationFailure =>
  ApplicationFailure.create({
    type: 'CompensationFailedError',
    message: `Compensation failed for ${compensatedActivityName}. Manual intervention may be required.`,
    nonRetryable: true, // Compensation failures are usually terminal for automated recovery
    details: originalError ? [originalError.name, originalError.message, originalError.stack] : undefined,
  });

/**
 * Generic ApplicationFailure for errors occurring during an activity's operation
 * where the specific error type is not one of the above.
 * @param message Error message
 * @param nonRetryable Whether this error should be considered non-retryable
 * @param details Additional details
 * @param type Custom type string for the error, defaults to 'ActivityOperationFailedError'
 * @returns ApplicationFailure instance
 */
export const ActivityOperationFailedError = (
  message: string,
  nonRetryable = false,
  details?: unknown[],
  type = 'ActivityOperationFailedError',
): ApplicationFailure =>
  ApplicationFailure.create({
    type,
    message,
    nonRetryable,
    details,
  });