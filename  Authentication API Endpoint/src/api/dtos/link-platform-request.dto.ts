/**
 * @file Defines the DTO for linking a platform account.
 */

/**
 * Specifies the data contract for a request to link a platform-specific account
 * (e.g., Google Play Games) to a user's primary game account.
 */
export class LinkPlatformRequestDto {
  /**
   * The name of the platform being linked.
   */
  public platform!: 'google-play' | 'apple-game-center';

  /**
   * The user's unique identifier on the specified platform.
   */
  public platformId!: string;
}