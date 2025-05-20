import { ApplicationFailure, Context } from '@temporalio/activity';
import { CompensationResponse, GrantEntitlementInput } from '../../interfaces/iap.interfaces'; // Placeholder
import { PlayerInventoryClient } from '../../services/player_inventory_client'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  playerInventoryClient: PlayerInventoryClient;
}

// Input should mirror what's needed to revert, typically same as GrantEntitlementInput
export async function compensateGrantEntitlementActivity(
  input: GrantEntitlementInput
): Promise<CompensationResponse> {
  const { playerId, productId, transactionId, itemsToGrant, currencyToGrant } = input;
  const { playerInventoryClient, log } = Context.current<ActivityContext>();

  log.info('Compensate grant entitlement activity started', { playerId, productId, transactionId });

  try {
    const response = await playerInventoryClient.revertItemsOrCurrency({
        playerId,
        transactionId, // Important for idempotency and tracking the reversal
        items: itemsToGrant || [],
        currencyDelta: currencyToGrant || 0,
    });

    if (!response.success) {
        log.error('Failed to compensate (revert) entitlement via PlayerInventoryClient', { playerId, transactionId, response });
        // Compensation failures are critical.
        throw ApplicationFailure.create({
            message: `Failed to compensate entitlement grant: ${response.errorMessage || 'Unknown error from inventory service'}`,
            type: 'CompensationFailedError', // A specific custom error for this
            nonRetryable: false, // Compensation should be retried robustly
            details: [response],
        });
    }

    log.info('Entitlement grant successfully compensated', { playerId, productId, transactionId });
    return response;
  } catch (error) {
    log.error('Error during entitlement grant compensation', { playerId, productId, transactionId, error });
    if (error instanceof ApplicationFailure) {
      throw error;
    }
    // This is a critical failure.
    throw ApplicationFailure.create({
      message: 'Failed to communicate with Player Inventory service for compensation',
      type: 'ServiceCommunicationError',
      cause: error as Error,
      nonRetryable: false, // Retry robustly
    });
  }
}