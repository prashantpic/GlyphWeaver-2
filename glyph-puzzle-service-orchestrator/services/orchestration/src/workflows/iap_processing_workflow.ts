import {
  proxyActivities,
  defineSignal,
  defineQuery,
  setHandler,
  workflowInfo,
  Saga,
  ApplicationFailure,
  condition,
} from '@temporalio/workflow';
import type * as activities from '../activities'; // Will import from the barrel file
import {
  IAPWorkflowInput,
  IAPValidationResult,
  GrantEntitlementInput,
  GrantEntitlementOutput,
  UpdatePlayerInventoryInput,
  UpdatePlayerInventoryOutput,
  TrackIAPEventInput,
  CompensateGrantEntitlementInput,
} from '../interfaces/iap.interfaces';
import { DefaultActivityRetryPolicy, IAPValidationActivityRetryPolicy } from '../error_handling/recovery_manager';
import { config } from '../config'; // Assuming config is available and typed

// Define activities type based on the (future) src/activities/index.ts exports
type AvailableActivities = typeof activities;

const {
  verifyIapReceiptActivity,
  grantEntitlementActivity,
  compensateGrantEntitlementActivity,
  updatePlayerInventoryActivity,
  trackIapEventActivity,
} = proxyActivities<AvailableActivities>({
  startToCloseTimeout: '60s', // Default timeout for activities
  retry: DefaultActivityRetryPolicy,
  // Activities will be resolved from the activities barrel based on their names
  // Ensure taskQueue is set on workers, not here globally unless intended.
});

// Specific retry policy for IAP validation
const { verifyIapReceiptActivity: verifyIapReceiptActivityWithCustomRetry } = proxyActivities<AvailableActivities>({
  startToCloseTimeout: '30s',
  retry: IAPValidationActivityRetryPolicy,
});


export async function iapProcessingWorkflow(input: IAPWorkflowInput): Promise<string> {
  const saga = new Saga();
  let iapValidated = false;
  let entitlementGranted = false;

  try {
    const validationResult: IAPValidationResult = await verifyIapReceiptActivityWithCustomRetry({
      receiptData: input.receiptData,
      productId: input.productId,
      platform: input.platform,
      transactionId: input.transactionId, // Pass through for consistency
    });

    if (!validationResult.isValid) {
      // Using create to ensure it's an ApplicationFailure that can be non-retryable for the workflow
      throw ApplicationFailure.create({
        message: `IAP receipt validation failed: ${validationResult.failureReason || 'Unknown reason'}`,
        type: 'IAPValidationFailedError',
        nonRetryable: true, // This workflow attempt should not be retried if validation fails
        details: [validationResult],
      });
    }
    iapValidated = true;

    const grantInput: GrantEntitlementInput = {
      playerId: input.playerId,
      productId: input.productId,
      transactionId: input.transactionId,
      quantity: input.quantity, // Assuming quantity comes from input
      validationData: validationResult.validationData, // Pass platform-specific validation data if any
    };
    const grantOutput: GrantEntitlementOutput = await grantEntitlementActivity(grantInput);
    entitlementGranted = true;

    saga.addCompensation(async () => {
      const compensateInput: CompensateGrantEntitlementInput = {
        playerId: input.playerId,
        transactionId: input.transactionId, // Or use grantOutput.internalTransactionId if available
        productId: input.productId,
        reason: 'IAP workflow failed, compensating entitlement.',
      };
      await compensateGrantEntitlementActivity(compensateInput);
    });

    // updatePlayerInventoryActivity: SDS says "details depend on merge status".
    // Assuming it's a distinct step for now. If it's part of grant, this might be removed.
    // If it makes changes needing compensation, it should also be part of the saga.
    // For now, if it fails, the grantEntitlement compensation should suffice if it reverts all of grant.
    const updateInventoryInput: UpdatePlayerInventoryInput = {
      playerId: input.playerId,
      transactionId: input.transactionId,
      itemsGranted: grantOutput.itemsGranted, // Or based on product ID
      currencyGranted: grantOutput.currencyGranted,
    };
    await updatePlayerInventoryActivity(updateInventoryInput);


    // Track success event. This is typically non-transactional in the sense of compensation.
    // If it fails, we usually don't roll back the IAP.
    const trackEventInput: TrackIAPEventInput = {
      playerId: input.playerId,
      transactionId: input.transactionId,
      eventName: 'IAPSuccess',
      eventData: {
        productId: input.productId,
        price: input.priceInCents, // Assuming these are part of input
        currency: input.currency,
        items: grantOutput.itemsGranted,
        virtualCurrency: grantOutput.currencyGranted,
      },
    };
    // Run as a separate, non-compensated step. Consider activity options for this (e.g., shorter timeout, different retries).
    await proxyActivities<AvailableActivities>({ startToCloseTimeout: '15s'})
      .trackIapEventActivity(trackEventInput);

    return `IAP for transaction ${input.transactionId} processed successfully.`;

  } catch (error) {
    // Log error details via workflow logger if available/needed
    // console.error('IAP workflow failed:', error); // Temporal logger is better

    // Track failure event only if validation passed but a subsequent step failed.
    // If validation itself failed, the error type will indicate that.
    if (iapValidated) { // Only track failure if validation was successful initially
        const trackFailureEventInput: TrackIAPEventInput = {
            playerId: input.playerId,
            transactionId: input.transactionId,
            eventName: 'IAPFailure',
            eventData: {
              productId: input.productId,
              reason: error instanceof Error ? error.message : 'Unknown processing error',
              step: entitlementGranted ? 'UpdateInventory/TrackEvent' : 'GrantEntitlement',
            },
          };
        try {
            // Fire-and-forget or with minimal retries, non-critical path
            await proxyActivities<AvailableActivities>({ startToCloseTimeout: '10s', retry: {maximumAttempts: 2} })
                .trackIapEventActivity(trackFailureEventInput);
        } catch (trackingError) {
            // Log tracking error but don't let it overshadow the main error
            console.warn('Failed to track IAP failure event:', trackingError);
        }
    }
    
    await saga.compensate(); // Execute compensations
    throw error; // Re-throw original error to mark workflow as failed
  }
}