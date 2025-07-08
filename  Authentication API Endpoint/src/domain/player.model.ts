/**
 * @file Defines the domain model for a Player.
 */

/**
 * Represents a user account in the system.
 * This is a core business entity.
 */
export interface Player {
  /**
   * Unique identifier for the player (UUID).
   */
  id: string;

  /**
   * Unique username for the player.
   */
  username: string;

  /**
   * Unique email address for the player.
   */
  email: string;

  /**
   * Hashed password for the player's custom account.
   */
  passwordHash: string;

  /**
   * A map of linked platform-specific accounts.
   * e.g., { 'google-play': 'g12345', 'apple-game-center': 'a67890' }
   */
  platformLinks: { [platform: string]: string };

  /**
   * Timestamp when the player account was created.
   */
  createdAt: Date;

  /**
   * Timestamp when the player account was last updated.
   */
  updatedAt: Date;
}