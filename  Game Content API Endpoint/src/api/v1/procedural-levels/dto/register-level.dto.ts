/**
 * Data Transfer Object (DTO) for the request body when registering a new
 * procedurally generated level instance. This interface defines the expected
 * structure and types of the incoming data from the game client.
 */
export interface RegisterLevelDto {
  /**
   * The ID of the handcrafted level template this was generated from.
   */
  readonly baseLevelId: string;

  /**
   * The seed used to generate the level, allowing for exact reproduction.
   */
  readonly generationSeed: string;

  /**
   * A JSON object containing all parameters used by the generation algorithm.
   * e.g., { gridSize: 5, obstacleCount: 3 }
   */
  readonly generationParameters: Record<string, any>;

  /**
   * A JSON object representing at least one valid solution path for the generated level.
   */
  readonly solutionPath: Record<string, any>;

  /**
   * The calculated complexity score for this specific instance.
   */
  readonly complexityScore: number;
}