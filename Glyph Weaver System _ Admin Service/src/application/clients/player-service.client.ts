/**
 * @file Defines the interface for the Player Service client.
 * @description This contract ensures that the application layer is decoupled from the
 * concrete implementation of the HTTP client (e.g., Axios).
 */

export interface IPlayerServiceClient {
  /**
   * Sends a request to the Player Service to delete a player's data.
   * @param playerId The ID of the player to delete.
   * @throws Will throw an error if the API call fails.
   */
  requestDeletion(playerId: string): Promise<void>;

  /**
   * Sends a request to the Player Service to retrieve a player's data export.
   * @param playerId The ID of the player whose data to access.
   * @returns The player's data export.
   * @throws Will throw an error if the API call fails.
   */
  requestDataAccess(playerId: string): Promise<any>;
}