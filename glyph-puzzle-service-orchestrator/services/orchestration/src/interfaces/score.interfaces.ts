import { PlayerID, Timestamp } from './common.interfaces';

/**
 * Raw score data submitted by the client.
 */
export interface RawScoreData {
  score: number;
  levelId: string; // Could be UUID or a numeric/string ID
  zoneId?: string; // Optional, depending on game structure
  // Additional metrics relevant to scoring and cheat detection:
  moves?: number;
  timeTakenMs?: number;
  gameSpecificMetrics?: Record<string, any>; // e.g., { "combos": 5, "powerupsUsed": 2 }
}

/**
 * Gameplay session data, potentially large and complex.
 * Can be a structured object or an opaque string (e.g., replay data).
 */
export type GameplaySessionData = Record<string, any> | string | null;

/**
 * Contextual information about the player/client submitting the score.
 */
export interface PlayerContext {
  clientVersion?: string;
  deviceModel?: string;
  ipAddress?: string; // Usually best to get this server-side if possible
  // other relevant context for cheat detection
  [key: string]: any; // Allow other properties
}

/**
 * Input for the Score Submission Workflow.
 */
export interface ScoreWorkflowInput {
  playerId: PlayerID;
  scoreData: RawScoreData;
  gameplaySessionData?: GameplaySessionData;
  playerContext?: PlayerContext;
  clientTimestamp?: Timestamp; // ISO8601 string
}

/**
 * Input for `validateScoreIntegrityActivity`.
 */
export interface ValidateScoreIntegrityActivityInput {
    scoreData: RawScoreData;
    gameplaySessionData?: GameplaySessionData;
}

/**
 * Result from the score integrity validation.
 */
export interface ScoreValidationResult {
  isValid: boolean;
  reason?: string; // If !isValid
}

/**
 * Input for `runCheatDetectionActivity`.
 */
export interface RunCheatDetectionActivityInput {
  playerId: PlayerID;
  scoreData: RawScoreData;
  gameplaySessionData?: GameplaySessionData;
  playerContext?: PlayerContext;
}

/**
 * Result from the cheat detection service/activity.
 */
export interface CheatDetectionResult {
  isCheater: boolean;
  reason?: string; // If isCheater
  confidenceScore?: number; // 0.0 to 1.0
  analysisDetails?: Record<string, any>; // More detailed report
}

/**
 * Input for `updateLeaderboardActivity`.
 */
export interface UpdateLeaderboardInput {
  playerId: PlayerID;
  score: number;
  levelId: string;
  zoneId?: string;
  timestamp: Timestamp; // ISO8601 string, when the score was achieved or submitted
  // Other details: e.g., character used, specific conditions
  additionalData?: Record<string, any>;
}

/**
 * Output from `updateLeaderboardActivity`.
 */
export interface UpdateLeaderboardOutput {
  submissionId: string; // ID of the leaderboard entry, useful for compensation
  rank?: number; // Optional: new rank if returned by the service
  message?: string;
}

/**
 * Input for `compensateUpdateLeaderboardActivity`.
 */
export interface CompensateUpdateLeaderboardInput {
  playerId: PlayerID;
  submissionId: string; // The ID from UpdateLeaderboardOutput
  reason: string;
}

/**
 * Input for `synchronizeCloudSaveActivity`.
 */
export interface SynchronizeCloudSaveInput {
  playerId: PlayerID;
  reason?: string; // Reason for sync trigger
}

/**
 * Input for `logScoreSubmissionAuditActivity`.
 * This structure should align with the `AuditLogEntry` common interface
 * but can be more specific for score submissions.
 */
export interface LogScoreSubmissionAuditInput {
  workflowId: string;
  playerId: PlayerID;
  scoreData: RawScoreData;
  gameplaySessionData?: GameplaySessionData; // Could be a summary or reference
  clientTimestamp?: Timestamp;
  outcome: 'Accepted' | 'Rejected' | 'Cheated' | 'Error';
  details: Record<string, any>; // e.g., validation errors, cheat detection results, error messages
}

/**
 * Generic response from leaderboard compensation.
 */
export interface LeaderboardCompensationResponse {
    success: boolean;
    message?: string;
}