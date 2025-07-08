import Joi from 'joi';

/**
 * Joi schema for validating a single analytics event.
 */
const eventSchema = Joi.object({
  /**
   * The name of the event. Must be a string between 3 and 100 characters.
   */
  eventName: Joi.string().min(3).max(100).required(),

  /**
   * The timestamp of the event. Must be a valid ISO 8601 date string.
   */
  eventTimestamp: Joi.date().iso().required(),

  /**
   * The event payload. Must be a non-null object.
   */
  payload: Joi.object().required(),
});

/**
 * Joi schema for validating the entire analytics ingestion request body.
 * This schema is used by the validation middleware to ensure data integrity
 * before it reaches the controller.
 */
export const ingestEventsSchema = Joi.object({
  /**
   * The session ID. Must be a valid version 4 UUID.
   */
  sessionId: Joi.string().guid({ version: 'uuidv4' }).required(),

  /**
   * The player ID. Can be a string, null, or an empty string, making it optional.
   */
  playerId: Joi.string().allow(null, ''),

  /**
   * An array of events. The array must contain at least 1 and at most 100 events.
   * Each item in the array must conform to the `eventSchema`.
   */
  events: Joi.array().items(eventSchema).min(1).max(100).required(),
});