/**
 * Data Transfer Object (DTO) for the successful response payload after
 * registering a new procedural level instance. It provides the client
 * with the unique identifier of the newly created resource.
 */
export interface LevelInstanceResponseDto {
  /**
   * The unique ID (_id) of the created procedural level instance document.
   */
  readonly proceduralLevelId: string;
}