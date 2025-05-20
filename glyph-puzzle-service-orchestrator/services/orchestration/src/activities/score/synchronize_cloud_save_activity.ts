import { ApplicationFailure, Context } from '@temporalio/activity';
import { CloudSaveClient } from '../../services/cloud_save_client'; // Placeholder
import { PlayerID } from '../../interfaces/common.interfaces'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  cloudSaveClient: CloudSaveClient;
}

interface SynchronizeCloudSaveActivityInput {
  playerId: PlayerID;
  // Optional: specific data that might influence the sync, though typically just a trigger
  triggerContext?: Record<string, any>; 
}

export async function synchronizeCloudSaveActivity(
  input: SynchronizeCloudSaveActivityInput
): Promise<void> {
  const { playerId, triggerContext } = input;
  const { cloudSaveClient, log } = Context.current<ActivityContext>();

  log.info('Synchronize cloud save activity started', { playerId });

  try {
    await cloudSaveClient.triggerSync(playerId, triggerContext);
    log.info('Cloud save synchronization successfully triggered', { playerId });
  } catch (error) {
    log.error('Error during cloud save synchronization trigger', { playerId, error });
    // Similar to analytics, this might be a non-critical failure for the saga's main goal.
    // If it *must* succeed as part of the score submission saga, then throw an error.
    // This activity typically doesn't have compensation in this context.
    // For example:
    // throw ApplicationFailure.create({
    //   message: 'Failed to trigger cloud save synchronization',
    //   type: 'ServiceCommunicationError',
    //   cause: error as Error,
    //   nonRetryable: true, // Or false with limited retries
    // });
  }
}