import { AnalyticsEvent } from '../models/AnalyticsEvent';

/**
 * Defines the contract for the data persistence layer for analytics events.
 * This interface decouples the application logic from the concrete database implementation (e.g., MongoDB).
 */
export interface IAnalyticsEventRepository {
  /**
   * Persists a batch of analytics events to the data store in a single, optimized operation.
   * @param {AnalyticsEvent[]} events - An array of AnalyticsEvent domain models to be saved.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  addBatch(events: AnalyticsEvent[]): Promise<void>;
}