/**
 * @file Defines the data transfer object for a leaderboard view response sent to the client.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Dtos
 */

import { LeaderboardEntryDto } from './leaderboard-entry.dto';

/**
 * Represents the complete data payload for displaying a leaderboard.
 * This defines the structured response for a request to view a leaderboard,
 * including the ranked entries and relevant metadata.
 */
export class LeaderboardViewDto {
  /**
   * The display name of the leaderboard.
   * @type {string}
   */
  public leaderboardName: string;

  /**
   * An array of ranked player entries for the current page.
   * @type {LeaderboardEntryDto[]}
   */
  public entries: LeaderboardEntryDto[];

  /**
   * The total number of scores submitted to this leaderboard.
   * @type {number}
   */
  public totalEntries: number;

  /**
   * The timestamp indicating when this data was generated (from cache or database).
   * @type {Date}
   */
  public lastRefreshed: Date;
}