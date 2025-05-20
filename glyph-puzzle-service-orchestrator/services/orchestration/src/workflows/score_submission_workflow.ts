import {
  proxyActivities,
  Saga,
  ApplicationFailure,
  workflowInfo,
} from '@temporalio/workflow';
import type * as activities from '../activities';
import {
  ScoreWorkflowInput,
  ScoreValidationResult,
  CheatDetectionResult,
  UpdateLeaderboardInput,
  UpdateLeaderboardOutput,
  SynchronizeCloudSaveInput,
  LogScoreSubmissionAuditInput,
  CompensateUpdateLeaderboardInput,
} from '../interfaces/score.interfaces';
import { PlayerID } from '../interfaces/common.interfaces';
import { DefaultActivityRetryPolicy, CriticalActivityRetryPolicy } from '../error_handling/recovery_manager';
import { config } from '../config'; // Assuming config is available

type AvailableActivities = typeof activities;

const {
  validateScoreIntegrityActivity,
  runCheatDetectionActivity,
  updateLeaderboardActivity,
  compensateUpdateLeaderboardActivity,
  synchronizeCloudSaveActivity,
  logScoreSubmissionAuditActivity,
} = proxyActivities<AvailableActivities>({
  startToCloseTimeout: '30s', // Default for score activities
  retry: DefaultActivityRetryPolicy,
});

// For critical audit logging, potentially different retry
const { logScoreSubmissionAuditActivity: criticalLogAuditActivity } = proxyActivities<AvailableActivities>({
    startToCloseTimeout: '30s',
    retry: CriticalActivityRetryPolicy, // More retries for audit
});


export async function scoreSubmissionWorkflow(input: ScoreWorkflowInput): Promise<string> {
  const saga = new Saga();
  let scoreOutcome: 'Accepted' | 'Rejected' | 'Cheated' = 'Rejected';
  let leaderboardSubmissionId: string | undefined;

  const auditLogBase: Omit<LogScoreSubmissionAuditInput, 'outcome' | 'details'> = {
    playerId: input.playerId,
    scoreData: input.scoreData,
    gameplaySessionData: input.gameplaySessionData,
    clientTimestamp: input.clientTimestamp,
    workflowId: workflowInfo().workflowId,
  };

  try {
    const validationResult: ScoreValidationResult = await validateScoreIntegrityActivity({
      scoreData: input.scoreData,
      gameplaySessionData: input.gameplaySessionData,
    });

    if (!validationResult.isValid) {
      scoreOutcome = 'Rejected';
      await criticalLogAuditActivity({
        ...auditLogBase,
        outcome: scoreOutcome,
        details: { rejectionReason: validationResult.reason || 'Integrity validation failed' },
      });
      throw ApplicationFailure.create({
        message: `Score integrity validation failed: ${validationResult.reason || 'Unknown reason'}`,
        type: 'ScoreIntegrityError',
        nonRetryable: true,
        details: [validationResult],
      });
    }

    const cheatResult: CheatDetectionResult = await runCheatDetectionActivity({
      playerId: input.playerId,
      scoreData: input.scoreData,
      gameplaySessionData: input.gameplaySessionData,
      playerContext: input.playerContext,
    });

    if (cheatResult.isCheater) {
      scoreOutcome = 'Cheated';
      await criticalLogAuditActivity({
        ...auditLogBase,
        outcome: scoreOutcome,
        details: { cheatReason: cheatResult.reason || 'Cheat detected', cheatConfidence: cheatResult.confidenceScore },
      });
      // Depending on policy, might throw or just return a specific status
      return `Score submission for player ${input.playerId} rejected due to cheat detection: ${cheatResult.reason || 'Details logged'}.`;
    }

    // If valid and not cheated:
    scoreOutcome = 'Accepted'; // Tentatively accepted

    const updateLeaderboardInput: UpdateLeaderboardInput = {
      playerId: input.playerId,
      score: input.scoreData.score,
      levelId: input.scoreData.levelId,
      zoneId: input.scoreData.zoneId, // Assuming these are part of scoreData
      timestamp: new Date(input.clientTimestamp || Date.now()).toISOString(), // Use client timestamp or server workflow time
      // Potentially other details needed for leaderboard entry
    };
    const leaderboardUpdate: UpdateLeaderboardOutput = await updateLeaderboardActivity(updateLeaderboardInput);
    leaderboardSubmissionId = leaderboardUpdate.submissionId; // Used for compensation

    saga.addCompensation(async () => {
      if (leaderboardSubmissionId) {
        const compensateLeaderboardInput: CompensateUpdateLeaderboardInput = {
          playerId: input.playerId,
          submissionId: leaderboardSubmissionId,
          reason: 'Score submission workflow failed, compensating leaderboard update.',
        };
        await compensateUpdateLeaderboardActivity(compensateLeaderboardInput);
      }
    });

    const syncCloudSaveInput: SynchronizeCloudSaveInput = {
      playerId: input.playerId,
      reason: 'Post score submission sync',
    };
    // This is often a fire-and-forget or best-effort, non-critical for the score itself
    await proxyActivities<AvailableActivities>({ startToCloseTimeout: '20s', retry: { maximumAttempts: 3 }})
        .synchronizeCloudSaveActivity(syncCloudSaveInput);


    await criticalLogAuditActivity({
      ...auditLogBase,
      outcome: scoreOutcome,
      details: { leaderboardSubmissionId },
    });

    return `Score submission for player ${input.playerId} processed successfully. Outcome: ${scoreOutcome}.`;

  } catch (error) {
    // If error is not an ApplicationFailure from validation or cheat detection handled above
    if (scoreOutcome !== 'Rejected' && scoreOutcome !== 'Cheated') {
      scoreOutcome = 'Rejected'; // Generic failure if not already set
    }

    await criticalLogAuditActivity({
      ...auditLogBase,
      outcome: scoreOutcome, // This might be 'Accepted' if failure happened after crucial steps but before end
      details: {
        error: error instanceof Error ? { message: error.message, name: error.name } : { message: String(error) },
        leaderboardSubmissionId, // Log if available
      },
    });
    
    await saga.compensate();
    throw error;
  }
}