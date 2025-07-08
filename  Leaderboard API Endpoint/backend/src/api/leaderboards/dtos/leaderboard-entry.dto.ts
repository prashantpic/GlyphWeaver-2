/**
 * @file Defines the data transfer object for a single entry within a leaderboard.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Dtos
 */

/**
 * Represents a single player's ranked entry on a leaderboard.
 * This defines the data structure for a single row in a leaderboard display,
 * containing all necessary information about a player's rank and score.
 */
export class LeaderboardEntryDto {
  /**
   * The player's rank on the leaderboard.
   * @type {number}
   */
  public rank: number;

  /**
   * The display name of the player.
   * @type {string}
   */
  public playerName: string;

  /**
   * The score achieved by the player.
   * @type {number}
   */
  public score: number;

  /**
   * The timestamp when the score was submitted.
   * @type {Date}
   */
  public submittedAt: Date;

  /**
   * The URL for the player's avatar image. Can be null if not available.
   * @type {string | null}
   */
  public avatarUrl: string | null;
}