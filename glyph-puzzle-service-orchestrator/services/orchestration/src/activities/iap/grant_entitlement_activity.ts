import { ApplicationFailure, Context } from '@temporalio/activity';
import { GrantEntitlementInput, InventoryUpdateResponse } from '../../interfaces/iap.interfaces'; // Placeholder
import { PlayerInventoryClient } from '../../services/player_inventory_client'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  playerInventoryClient: PlayerInventoryClient;
}

export async function grantEntitlementActivity(
  input: GrantEntitlementInput
): Promise<InventoryUpdateResponse> {
  const { playerId, productId, transactionId, itemsToGrant, currencyToGrant } = input;
  const { playerInventoryClient, log } = Context.current<ActivityContext>();

  log.info('Granting entitlement activity started', { playerId, productId, transactionId });

  try {
    const response = await playerInventoryClient.grantItemsOrCurrency({
        playerId,
        transactionId, // Assuming client needs this
        items: itemsToGrant || [],
        currencyDelta: currencyToGrant || 0,
    });

    if (!response.success) {
        log.error('Failed to grant entitlement via PlayerInventoryClient', { playerId, transactionId, response });
        throw ApplicationFailure.create({
            message: `Failed to grant entitlement: ${response.errorMessage || 'Unknown error from inventory service'}`,
            type: 'EntitlementGrantFailedError',
            nonRetryable: response.isNonRetryableError || false, // The service client should indicate this
            details: [response],
        });
    }

    log.info('Entitlement successfully granted', { playerId, productId, transactionId });
    return response;
  } catch (error) {
    log.error('Error during entitlement grant', { playerId, productId, transactionId, error });
    if (error instanceof ApplicationFailure) {
      throw error;
    }
    throw ApplicationFailure.create({
      message: 'Failed to communicate with Player Inventory service for granting entitlement',
      type: 'ServiceCommunicationError',
      cause: error as Error,
      nonRetryable: false, 
    });
  }
}