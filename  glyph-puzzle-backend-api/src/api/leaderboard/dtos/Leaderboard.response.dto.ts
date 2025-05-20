export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  score: number;
  rank: number;
}

export class LeaderboardResponseDTO {
  leaderboardId!: string;
  entries!: LeaderboardEntry[];
  totalEntries?: number;
  playerEntry?: LeaderboardEntry; // The requesting player's entry, if applicable
}