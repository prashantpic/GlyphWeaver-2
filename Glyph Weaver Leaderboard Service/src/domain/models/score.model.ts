import { randomUUID } from 'crypto';

/**
 * Represents a player's submitted score for a leaderboard.
 * This is a core domain entity, encapsulating the properties and
 * intrinsic business rules of a score submission. It is persistence-ignorant.
 */
export class Score {
  public readonly id: string;
  public readonly leaderboardId: string;
  public readonly playerId: string;
  public readonly scoreValue: number;
  public readonly tieBreakerValue: number;
  public readonly submittedAt: Date;
  public readonly metadata: Record<string, any>;

  private isSuspicious: boolean;
  private suspicionReason: string | null;

  constructor(
    leaderboardId: string,
    playerId: string,
    scoreValue: number,
    tieBreakerValue: number,
    metadata: Record<string, any>,
    id?: string,
    submittedAt?: Date,
  ) {
    if (scoreValue < 0) {
      throw new Error('Score value cannot be negative.');
    }

    this.id = id ?? randomUUID();
    this.leaderboardId = leaderboardId;
    this.playerId = playerId;
    this.scoreValue = scoreValue;
    this.tieBreakerValue = tieBreakerValue;
    this.submittedAt = submittedAt ?? new Date();
    this.metadata = metadata;
    this.isSuspicious = false;
    this.suspicionReason = null;
  }

  /**
   * Flags the score as suspicious and records the reason.
   * @param reason - A description of why the score is considered suspicious.
   */
  public flagAsSuspicious(reason: string): void {
    this.isSuspicious = true;
    this.suspicionReason = reason;
  }

  /**
   * Gets the suspicious status of the score.
   * @returns True if the score is flagged as suspicious, false otherwise.
   */
  public getIsSuspicious(): boolean {
    return this.isSuspicious;
  }

  /**
   * Gets the reason for the score being flagged as suspicious.
   * @returns The reason string, or null if not flagged.
   */
  public getSuspicionReason(): string | null {
    return this.suspicionReason;
  }
}