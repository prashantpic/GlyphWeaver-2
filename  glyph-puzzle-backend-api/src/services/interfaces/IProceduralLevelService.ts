import { LevelSeedRequestDTO } from '../../api/procedural-level/dtos/LevelSeed.request.dto';
import { LevelSeedResponseDTO } from '../../api/procedural-level/dtos/LevelSeed.response.dto';

export interface IProceduralLevelService {
  /**
   * Requests a new procedural level seed based on player parameters.
   * @param playerId - The ID of the player requesting the seed.
   * @param parameters - DTO containing parameters for seed generation/selection.
   * @returns A promise that resolves to a LevelSeedResponseDTO.
   */
  requestNewSeed(
    playerId: string,
    parameters: LevelSeedRequestDTO, // Using the same DTO for request parameters as per SDS
  ): Promise<LevelSeedResponseDTO>;

  /**
   * Logs the details of a procedural level played by the client.
   * @param playerId - The ID of the player who played the level.
   * @param logData - DTO containing the seed, outcome, stats, etc.
   * @returns A promise that resolves when logging is complete.
   */
  logUsedSeed(
    playerId: string,
    logData: LevelSeedRequestDTO, // Using the same DTO for logging as per SDS
  ): Promise<void>;
}