/**
 * Data Transfer Object (DTO) for a single analytics event.
 * This interface defines the expected structure of an individual event
 * as sent by the game client within a larger batch.
 */
export interface AnalyticsEventDto {
  /**
   * The programmatic name of the event (e.g., 'level_start', 'hint_used').
   */
  eventName: string;

  /**
   * The timestamp when the event occurred on the client, in ISO 8601 format.
   * Example: "2023-10-27T10:00:00.000Z"
   */
  eventTimestamp: string;

  /**
   * A flexible object containing event-specific data.
   * The structure of the payload will vary depending on the eventName.
   */
  payload: Record<string, any>;
}