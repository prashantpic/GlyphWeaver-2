import { z } from 'zod';

/**
 * Defines the validation schema for a single event object sent by the client.
 */
export const IncomingEventSchema = z.object({
  eventName: z.string({ required_error: 'eventName is required' }).min(1, 'eventName cannot be empty').max(100, 'eventName is too long'),
  clientTimestamp: z.string({ required_error: 'clientTimestamp is required' }).datetime({ message: 'Invalid ISO 8601 datetime format for clientTimestamp' }),
  clientVersion: z.string({ required_error: 'clientVersion is required' }).min(1, 'clientVersion cannot be empty'),
  payload: z.record(z.any(), { required_error: 'payload is required' }).refine(val => typeof val === 'object' && val !== null, {
    message: 'payload must be an object'
  }),
});

/**
 * Defines the validation schema for the root object of the ingestion request body,
 * which contains a batch of events.
 */
export const IngestEventsDtoSchema = z.object({
  events: z.array(IncomingEventSchema).min(1, { message: 'Events array cannot be empty' }).max(500, { message: 'Cannot process more than 500 events per batch' }),
});

/**
 * Represents the validated and typed Data Transfer Object for an analytics ingestion request.
 */
export type IngestEventsDto = z.infer<typeof IngestEventsDtoSchema>;