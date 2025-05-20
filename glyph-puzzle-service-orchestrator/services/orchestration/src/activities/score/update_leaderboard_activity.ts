import { ApplicationFailure, Context } from '@temporalio/activity';
import { LeaderboardSubmissionResponse, ScoreDetails } from '../../interfaces/score.interfaces'; // Placeholder
import { LeaderboardClient } from '../../services/leaderboard_client'; // Placeholder
import { PlayerID } from '../../interfaces/common.interfaces'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  leaderboardClient: LeaderboardClient;
}

interface UpdateLeaderboardActivityInput {
  playerId: PlayerID;
  scoreDetails: ScoreDetails; // Contains score, levelId, timestamp, etc.
  leaderboardId?: string; // Optional: if multiple leaderboards for a score
}

export async function updateLeaderboardActivity(
  input: UpdateLeaderboardActivityInput
): Promise<LeaderboardSubmissionResponse> {
  const { playerId, scoreDetails, leaderboardId } = input;
  const { leaderboardClient, log } = Context.current<ActivityContext>();

  log.info('Update leaderboard activity started', { playerId, score: scoreDetails.score, levelId: scoreDetails.levelId });

  try {
    const response = await leaderboardClient.submitScore({
        playerId,
        scoreDetails,
        leaderboardId, // Pass if provided
    });

    if (!response.success) {
        log.error('Failed to update leaderboard via LeaderboardClient', { playerId, scoreDetails, response });
        throw ApplicationFailure.create({
            message: `Failed to update leaderboard: ${response.errorMessage || 'Unknown error from leaderboard service'}`,
            type: 'LeaderboardUpdateFailedError',
            nonRetryable: response.isNonRetryableError || false,
            details: [response],
        });
    }

    log.info('Leaderboard successfully updated', { playerId, score: scoreDetails.score, submissionId: response.submissionId });
    return response;
  } catch (error) {
    log.error('Error during leaderboard update', { playerId, scoreDetails, error });
    if (error instanceof ApplicationFailure) {
      throw error;
    }
    throw ApplicationFailure.create({
      message: 'Failed to communicate with Leaderboard service',
      type: 'ServiceCommunicationError',
      cause: error as Error,
      nonRetryable: false,
    });
  }
}