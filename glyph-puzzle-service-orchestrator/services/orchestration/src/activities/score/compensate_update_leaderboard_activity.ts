import { ApplicationFailure, Context } from '@temporalio/activity';
import { LeaderboardClient } from '../../services/leaderboard_client'; // Placeholder
import { PlayerID } from '../../interfaces/common.interfaces'; // Placeholder
import { LeaderboardCompensationResponse } from '../../interfaces/score.interfaces'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  leaderboardClient: LeaderboardClient;
}

interface CompensateUpdateLeaderboardActivityInput {
  playerId: PlayerID;
  submissionId: string; // The ID of the score submission to remove/invalidate
  leaderboardId?: string; // If applicable
}

export async function compensateUpdateLeaderboardActivity(
  input: CompensateUpdateLeaderboardActivityInput
): Promise<LeaderboardCompensationResponse> {
  const { playerId, submissionId, leaderboardId } = input;
  const { leaderboardClient, log } = Context.current<ActivityContext>();

  log.info('Compensate update leaderboard activity started', { playerId, submissionId });

  try {
    const response = await leaderboardClient.removeOrInvalidateScore({
        playerId,
        submissionId,
        leaderboardId,
    });
    
    if (!response.success) {
        log.error('Failed to compensate (remove/invalidate) leaderboard score via LeaderboardClient', { playerId, submissionId, response });
        throw ApplicationFailure.create({
            message: `Failed to compensate leaderboard update: ${response.errorMessage || 'Unknown error from leaderboard service'}`,
            type: 'CompensationFailedError',
            nonRetryable: false, // Compensation should be retried robustly
            details: [response],
        });
    }

    log.info('Leaderboard update successfully compensated', { playerId, submissionId });
    return response;
  } catch (error) {
    log.error('Error during leaderboard update compensation', { playerId, submissionId, error });
    if (error instanceof ApplicationFailure) {
      throw error;
    }
    throw ApplicationFailure.create({
      message: 'Failed to communicate with Leaderboard service for compensation',
      type: 'ServiceCommunicationError',
      cause: error as Error,
      nonRetryable: false, // Retry robustly
    });
  }
}