/**
 * Base structure for any analytics event.
 */
export interface AnalyticsEvent {
  /** Unique name identifying the type of event (e.g., 'level_completed', 'glyph_connected'). */
  eventName: string;
  /** ISO 8601 timestamp of when the event occurred on the client. */
  timestamp: string; // Zod validates this as datetime string
  /** Unique identifier for the user. */
  userId: string;
  /** Unique identifier for the current game session or application instance. */
  sessionId: string;
  /** Optional properties specific to the event (e.g., level_id, score, path_length). */
  eventProperties?: Record<string, any>;
  /** Optional metadata about the event context (e.g., device_info, app_version). */
  metadata?: Record<string, any>;
  /**
   * Status of user consent for this event type.
   * This might be provided by the client or determined/overridden server-side.
   */
  userConsentStatus?: 'granted' | 'denied' | 'unknown';
}

/**
 * Interface for the payload expected by the analytics ingestion endpoint.
 * Can be a single event or an array of events.
 * Zod schema handles this union type for validation.
 */
export type AnalyticsIngestionPayload = AnalyticsEvent | AnalyticsEvent[];