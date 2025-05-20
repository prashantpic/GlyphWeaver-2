import { ApplicationFailure, Context } from '@temporalio/activity';
import { ScoreSubmissionData, CheatDetectionResult, PlayerContext } from '../../interfaces/score.interfaces'; // Placeholder
import { CheatDetectionClient } from '../../services/cheat_detection_client'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  cheatDetectionClient: CheatDetectionClient;
}

interface RunCheatDetectionActivityInput {
  scoreData: ScoreSubmissionData; // Or a subset relevant for cheat detection
  playerContext: PlayerContext; // e.g. { playerId, sessionId, deviceId, ipAddress }
}

export async function runCheatDetectionActivity(
  input: RunCheatDetectionActivityInput
): Promise<CheatDetectionResult> {
  const { scoreData, playerContext } = input;
  const { cheatDetectionClient, log } = Context.current<ActivityContext>();

  log.info('Run cheat detection activity started', { playerId: playerContext.playerId, score: scoreData.score });

  try {
    const result = await cheatDetectionClient.analyzeScore(scoreData, playerContext);

    log.info('Cheat detection analysis complete', { playerId: playerContext.playerId, result });
    // The workflow will decide what to do based on result.isCheated
    return result;

  } catch (error) {
    log.error('Error during cheat detection', { playerId: playerContext.playerId, error });
    if (error instanceof ApplicationFailure) {
      throw error;
    }
    // This could be a ServiceCommunicationError or a specific CheatDetectionServiceError
    throw ApplicationFailure.create({
      message: 'Failed to communicate with Cheat Detection service',
      type: 'ServiceCommunicationError',
      cause: error as Error,
      nonRetryable: false, // Or true if the service itself indicates a non-retryable data issue
    });
  }
}