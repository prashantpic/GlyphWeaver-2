import { ApplicationFailure, Context } from '@temporalio/activity';
import { AuditLoggerClient } from '../../services/audit_logger_client'; // Placeholder
import { AuditLogEntry, PlayerID } from '../../interfaces/common.interfaces'; // Placeholder
import { ScoreSubmissionData, ValidationResult, CheatDetectionResult } from '../../interfaces/score.interfaces'; // Placeholder

// Placeholder for actual client type
interface ActivityContext extends Context {
  auditLoggerClient: AuditLoggerClient;
}

interface LogScoreSubmissionAuditActivityInput {
  playerId: PlayerID;
  scoreData: ScoreSubmissionData;
  validationResult?: ValidationResult; // Optional, if validation failed early
  cheatDetectionResult?: CheatDetectionResult; // Optional
  leaderboardSubmissionId?: string; // Optional
  outcome: 'Accepted' | 'Rejected_Validation' | 'Rejected_Cheat' | 'Failed_Leaderboard' | 'Failed_Other';
  errorMessage?: string;
  ipAddress?: string; // Should be captured earlier in the request flow
}

export async function logScoreSubmissionAuditActivity(
  input: LogScoreSubmissionAuditActivityInput
): Promise<void> {
  const { log, auditLoggerClient } = Context.current<ActivityContext>();
  const { playerId, scoreData, validationResult, cheatDetectionResult, leaderboardSubmissionId, outcome, errorMessage, ipAddress } = input;

  log.info('Log score submission audit activity started', { playerId, outcome });

  const auditEntry: AuditLogEntry = {
    eventType: 'ScoreSubmissionProcessed',
    userId: playerId,
    ipAddress: ipAddress, // Should be populated if available
    timestamp: new Date().toISOString(),
    details: {
      scoreData,
      validationResult,
      cheatDetectionResult,
      leaderboardSubmissionId,
      processingOutcome: outcome,
      errorMessage,
    },
  };

  try {
    await auditLoggerClient.logEvent(auditEntry);
    log.info('Score submission audit event successfully logged', { playerId, outcome });
  } catch (error) {
    log.error('Error during score submission audit logging', { playerId, outcome, error });
    // Audit logging is critical. If it fails, it should usually be retried.
    // A failure here doesn't typically roll back the main transaction but needs attention.
    throw ApplicationFailure.create({
      message: 'Failed to log score submission audit event',
      type: 'AuditLogFailedError', // Custom error
      cause: error as Error,
      nonRetryable: false, // Should be retried
    });
  }
}