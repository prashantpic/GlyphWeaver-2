import { IAnalyticsEventRepository } from '../../domain/repositories/IAnalyticsEventRepository';
import { AnalyticsEvent } from '../../domain/models/AnalyticsEvent';
import { AnalyticsEventModel, IAnalyticsEventDocument } from '../database/schemas/AnalyticsEvent.schema';
import { logger } from '../../utils/logger';

/**
 * Concrete repository implementation for persisting analytics events to MongoDB using Mongoose.
 */
export class MongoAnalyticsEventRepository implements IAnalyticsEventRepository {

  /**
   * Persists a batch of analytics events to MongoDB using `insertMany` for high efficiency.
   * @param {AnalyticsEvent[]} events - An array of AnalyticsEvent domain models.
   * @returns {Promise<void>}
   */
  public async addBatch(events: AnalyticsEvent[]): Promise<void> {
    if (events.length === 0) {
      return;
    }

    // Map the domain model `id` to the Mongoose `_id` field.
    const documents: IAnalyticsEventDocument[] = events.map(event => ({
      ...event,
      _id: event.id,
    })) as IAnalyticsEventDocument[];

    try {
      // `insertMany` is a highly optimized bulk write operation in MongoDB.
      // `ordered: false` ensures that if one document in the batch fails validation,
      // the other valid documents are still inserted. This is crucial for a high-throughput
      // system where losing an entire batch for one bad event is undesirable.
      await AnalyticsEventModel.insertMany(documents, { ordered: false });
    } catch (error) {
      // We log the error for monitoring and alerting purposes but do not re-throw it.
      // This honors the "fire-and-forget" contract with the service layer. The client
      // has already received a 202 Accepted and should not be concerned with a
      // partial failure on the backend. Failed events are considered lost, though
      // a dead-letter queue could be implemented here for more robust error handling.
      logger.error({ error, batchSize: documents.length }, 'Failed to insert event batch. Some events may have been lost.');
    }
  }
}