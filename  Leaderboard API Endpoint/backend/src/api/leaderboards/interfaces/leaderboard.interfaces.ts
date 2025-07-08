/**
 * @file A central file for all TypeScript interface definitions (contracts) used within the leaderboard feature.
 * @description This file establishes contracts between different layers of the leaderboard API,
 * promoting loose coupling and making components interchangeable and mockable for tests.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Interfaces
 */

import { Document } from 'mongoose';
import { LeaderboardEntryDto } from '../dtos/leaderboard-entry.dto';
import { LeaderboardViewDto } from '../dtos/leaderboard-view.dto';
import { SubmitScoreDto } from '../dtos/submit-score.dto';

// --- Data Transfer Object Interfaces (already defined in dtos/*) ---
// We re-export them here for consumers of this central interface file.
export { LeaderboardEntryDto, LeaderboardViewDto, SubmitScoreDto };


// --- Model Interfaces ---

/**
 * Represents a document in the `leaderboards` collection.
 */
export interface ILeaderboard extends Document {
  keyName: string;
  name: string;
  scope: 'global' | 'event';
  tieBreakingFields: { field: string; order: 1 | -1 }[];
  associatedLevelId?: string;
  isActive: boolean;
}

/**
 * Represents a document in the `playerScores` collection.
 */
export interface IPlayerScore extends Document {
  leaderboardId: string;
  userId: string | IPlayerProfile; // Can be populated
  scoreValue: number;
  metadata: {
    completionTime: number;
    moves: number;
  };
  timestamp: Date;
}

/**
 * Placeholder interface for a PlayerProfile document from another domain.
 */
export interface IPlayerProfile extends Document {
    username: string;
    avatarUrl?: string;
    isExcludedFromLeaderboards?: boolean;
}

/**
 * Placeholder interface for a Level document from another domain.
 */
export interface ILevel extends Document {
    maxPossibleScore?: number;
}

/**
 * Placeholder interface for an AuditLog document.
 */
export interface IAuditLog extends Document {
    eventType: string;
    userId?: string;
    details: object;
}


// --- Repository Interfaces ---

/**
 * Contract for a repository that manages PlayerScore data persistence.
 */
export interface IScoreRepository {
  create(scoreData: Partial<IPlayerScore>): Promise<IPlayerScore>;
  findByLeaderboard(leaderboardId: string, options: { limit: number, offset: number }, tieBreakingFields: any[]): Promise<IPlayerScore[]>;
  getPlayerRank(leaderboardId: string, userId: string): Promise<number | null>;
}

/**
 * Contract for a repository that manages Leaderboard definition data persistence.
 */
export interface ILeaderboardRepository {
  findByKeyName(keyName: string): Promise<ILeaderboard | null>;
}

/**
 * Contract for a repository that manages PlayerProfile data access.
 */
export interface IPlayerRepository {
  findManyByIds(userIds: string[]): Promise<Map<string, { username: string; avatarUrl?: string }>>;
  setLeaderboardExclusion(userId: string, isExcluded: boolean): Promise<void>;
}

/**
 * Contract for a repository that persists audit logs.
 */
export interface IAuditLogRepository {
    create(logData: Partial<IAuditLog>): Promise<IAuditLog>;
}

/**
 * Contract for a repository that manages Level data access.
 */
export interface ILevelRepository {
    findById(id: string): Promise<ILevel | null>;
}


// --- Provider & Service Interfaces ---

/**
 * Contract for a caching provider (e.g., Redis).
 */
export interface ICacheProvider {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  invalidateByPattern(pattern: string): Promise<void>;
}

/**
 * Contract for a service that validates score submissions for cheating.
 */
export interface ICheatDetectionService {
  isScoreValid(submission: SubmitScoreDto, leaderboard: ILeaderboard, userId: string): Promise<boolean>;
}

/**
 * Contract for a service that logs auditable events.
 */
export interface IAuditService {
  logScoreSubmission(details: { userId: string; leaderboardKey: string; score: number; isValid: boolean; }): Promise<void>;
  logSuspiciousActivity(details: { userId: string; reason: string; submissionData: object; }): Promise<void>;
  logAdminAction(details: { adminId: string; action: string; targetUserId: string; }): Promise<void>;
}

/**
 * Contract for the main service that orchestrates all leaderboard business logic.
 */
export interface ILeaderboardService {
  getLeaderboardView(leaderboardKey: string, options: { limit: number; offset: number; }): Promise<LeaderboardViewDto>;
  processScoreSubmission(leaderboardKey: string, userId: string, submission: SubmitScoreDto): Promise<{ rank: number | null }>;
  getPlayerRankView(leaderboardKey: string, userId: string): Promise<LeaderboardEntryDto>;
  excludePlayerFromLeaderboards(userId: string, adminId: string): Promise<void>;
}