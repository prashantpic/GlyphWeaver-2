import { IBaseRepository } from './IBaseRepository';
import { LeaderboardEntryDocument, LeaderboardEntryModel } from '../../domain/leaderboard/LeaderboardEntry.schema';

export type LeaderboardEntryType = Partial<Omit<LeaderboardEntryDocument, keyof Document | 'schemaVersion' | 'createdAt' | 'updatedAt'>>;


export interface ILeaderboardRepository extends IBaseRepository<LeaderboardEntryDocument, LeaderboardEntryModel> {
  getTopScoresForLevel(levelId: string, limit: number): Promise<LeaderboardEntryDocument[]>;
  getPlayerRankForLevel(levelId: string, playerId: string): Promise<number | null>;
  submitScore(entryData: LeaderboardEntryType): Promise<LeaderboardEntryDocument>;
  getTopScoresForZone(zoneId: string, limit: number): Promise<LeaderboardEntryDocument[]>;
  getPlayerRankForZone(zoneId: string, playerId: string): Promise<number | null>;
}