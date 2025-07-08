import { AnalyticsEventDto } from './analytics-event.dto';

/**
 * Data Transfer Object (DTO) for the entire analytics ingestion request.
 * This defines the shape of the JSON body sent to the `/events` endpoint.
 */
export interface IngestEventsRequestDto {
  /**
   * A unique identifier for the game session. All events in the batch
   * belong to this session.
   */
  sessionId: string;

  /**
   * The unique identifier for the player. This is optional to accommodate
   * events that occur before a player has logged in or created an account.
   */
  playerId?: string;

  /**
   * An array of individual analytics events that occurred during the session.
   * The batching of events reduces the number of HTTP requests from the client.
   */
  events: AnalyticsEventDto[];
}