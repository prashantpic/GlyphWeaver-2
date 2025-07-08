import { Model } from 'mongoose';
import { IRawAnalyticsEvent } from '../models/raw-analytics-event.model';
import { IngestEventsRequestDto } from '../../../application/dtos/ingest-events-request.dto';

/**
 * Interface for the Raw Analytics Event Repository.
 * This defines the contract for data access operations related to analytics events,
 * allowing for dependency injection and easier testing.
 */
export interface IRawAnalyticsEventRepository {
  /**
   * Persists a batch of analytics events to the database.
   * @param ingestRequest - The DTO containing the session/player info and an array of events.
   * @returns A promise that resolves when the operation is complete.
   */
  saveBatch(ingestRequest: IngestEventsRequestDto): Promise<void>;
}

/**
 * Implements the data access layer for persisting raw analytics events to MongoDB.
 */
export class RawAnalyticsEventRepository implements IRawAnalyticsEventRepository {
  private readonly analyticsEventModel: Model<IRawAnalyticsEvent>;

  /**
   * Constructs a new RawAnalyticsEventRepository.
   * @param analyticsEventModel The Mongoose model for RawAnalyticsEvent documents.
   */
  constructor(analyticsEventModel: Model<IRawAnalyticsEvent>) {
    this.analyticsEventModel = analyticsEventModel;
  }

  /**
   * Transforms and inserts a batch of analytics events into the database.
   * This method is optimized for bulk insertion.
   * @param ingestRequest - The DTO containing the session/player info and array of events.
   */
  public async saveBatch(ingestRequest: IngestEventsRequestDto): Promise<void> {
    // 1. Map the DTO to the Mongoose model format.
    //    This step combines the common sessionId and playerId with each individual event object.
    const documentsToInsert = ingestRequest.events.map(event => ({
      sessionId: ingestRequest.sessionId,
      playerId: ingestRequest.playerId,
      eventName: event.eventName,
      eventTimestamp: new Date(event.eventTimestamp), // Ensure timestamp is a Date object
      payload: event.payload,
    }));

    if (documentsToInsert.length === 0) {
      return;
    }

    // 2. Use insertMany for efficient bulk insertion into the database.
    // The `{ ordered: false }` option allows the operation to continue even if some
    // documents in the batch fail validation, ensuring that valid events are still inserted.
    // This improves the robustness of the ingestion pipeline.
    await this.analyticsEventModel.insertMany(documentsToInsert, { ordered: false });
  }
}