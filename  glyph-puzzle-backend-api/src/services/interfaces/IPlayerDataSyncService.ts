import { PlayerDataDTO } from '../../api/player-data/dtos/PlayerData.dto';
import { SyncResponseDTO } from '../../api/player-data/dtos/Sync.response.dto';

export interface IPlayerDataSyncService {
  /**
   * Fetches the authenticated player's data.
   * @param playerId - The ID of the authenticated player.
   * @returns A promise that resolves to the PlayerDataDTO.
   */
  getPlayerData(playerId: string): Promise<PlayerDataDTO>;

  /**
   * Synchronizes player data sent by the client with the server's version.
   * @param playerId - The ID of the authenticated player.
   * @param clientData - The player data DTO from the client.
   * @returns A promise that resolves to a SyncResponseDTO containing the latest server data.
   */
  syncPlayerData(
    playerId: string,
    clientData: PlayerDataDTO,
  ): Promise<SyncResponseDTO>;
}