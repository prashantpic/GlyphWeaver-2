/**
 * @file Defines the data transfer object for a score submission request from the client.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Dtos
 */

/**
 * Represents the data structure for a client submitting a new score to a leaderboard.
 * This class defines a clear, typed contract for the data expected in the body of a score submission API request.
 */
export class SubmitScoreDto {
  /**
   * The primary score value achieved by the player.
   * @type {number}
   */
  public score: number;

  /**
   * The time taken to complete the level or event, in milliseconds or seconds.
   * Used for tie-breaking.
   * @type {number}
   */
  public completionTime: number;

  /**
   * The number of moves used to achieve the score.
   * Used for tie-breaking.
   * @type {number}
   */
  public moves: number;

  /**
   * A server-verifiable hash to prevent basic data tampering.
   * Typically a SHA-256 HMAC of key game-state variables.
   * @type {string}
   */
  public validationHash: string;
}