import { z } from 'zod';

/**
 * Zod schema for the basic structure of a single analytics event.
 * Defines required fields and their types for incoming analytics data.
 */
export const analyticsEventSchema = z.object({
  /** Unique name identifying the type of event (e.g., 'level_completed', 'glyph_connected'). */
  eventName: z.string().min(1, { message: 'Event name cannot be empty.' }),

  /** ISO 8601 timestamp string of when the event occurred on the client. */
  timestamp: z.string().datetime({ message: 'Timestamp must be a valid ISO 8601 datetime string.' }),

  /** Unique identifier for the user. */
  userId: z.string().min(1, { message: 'User ID cannot be empty.' }),

  /** Unique identifier for the current game session or application instance. */
  sessionId: z.string().min(1, { message: 'Session ID cannot be empty.' }),

  /** Optional properties specific to the event (e.g., level_id, score, path_length). */
  eventProperties: z.record(z.any()).optional().default({}), // Allows any key-value pairs

  /** Optional metadata about the event context (e.g., device_info, app_version). */
  metadata: z.record(z.any()).optional().default({}), // Allows any key-value pairs for metadata

  /**
   * Optional client-provided consent status for this event type.
   * Server-side consent check (middleware) should take precedence.
   * REQ-AMOT-001
   */
  userConsentStatus: z.enum(['granted', 'denied', 'unknown'], {
    errorMap: () => ({ message: "userConsentStatus must be one of 'granted', 'denied', or 'unknown'." })
  }).optional().default('unknown'),
});

/**
 * Zod schema for the incoming analytics ingestion payload.
 * The payload can be either a single analytics event object
 * or an array of analytics event objects (must contain at least one event).
 */
export const analyticsIngestionPayloadSchema = z.union([
  analyticsEventSchema, // Allows a single event object
  z.array(analyticsEventSchema).min(1, { message: 'If providing an array of events, it cannot be empty.' }), // Allows an array of one or more events
]);

// Example of a more specific event schema (optional, if needed for typed eventProperties)
// export const specificEventPropertiesSchema = z.object({
//   levelId: z.string(),
//   score: z.number().int(),
// });
//
// export const specificEventSchema = analyticsEventSchema.extend({
//   eventName: z.literal('specific_event_name'), // Enforce specific event name
//   eventProperties: specificEventPropertiesSchema,
// });