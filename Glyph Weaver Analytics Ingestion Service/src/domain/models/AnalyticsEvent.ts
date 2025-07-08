/**
 * Represents the canonical structure of a single analytics event within the system.
 * This is the core domain entity.
 */
export interface AnalyticsEvent {
  /**
   * A unique identifier for the event, generated on the server.
   * @type {string} - UUID format.
   */
  id: string;

  /**
   * A client-generated unique ID for the game session.
   * @type {string}
   */
  sessionId: string;

  /**
   * The unique identifier for the user, if authenticated.
   * Null for anonymous users.
   * @type {string | null}
   */
  userId: string | null;

  /**
   * The name of the event (e.g., 'level_start', 'setting_changed').
   * @type {string}
   */
  eventName: string;

  /**
   * The timestamp when the event occurred on the client.
   * @type {Date} - ISO 8601 format.
   */
  clientTimestamp: Date;

  /**
   * The timestamp when the event was received by the server.
   * @type {Date}
   */
  serverTimestamp: Date;

  /**
   * The version of the game client that sent the event.
   * @type {string} - e.g., "1.0.3"
   */
  clientVersion: string;

  /**
   * A flexible object containing event-specific data.
   * @type {Record<string, any>}
   */
  payload: Record<string, any>;

  /**
   * Geographic information derived from the client's IP address.
   * Null if Geo-IP lookup is disabled or fails.
   * @type {{ country?: string; region?: string; city?: string; } | null}
   */
  geo: {
    country?: string;
    region?: string;
    city?: string;
  } | null;
}