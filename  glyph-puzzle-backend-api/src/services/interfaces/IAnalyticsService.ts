import { AnalyticsEventDTO } from '../../api/analytics/dtos/AnalyticsEvent.dto';

export interface IAnalyticsService {
  /**
   * Ingests a batch of analytics events.
   * @param events - An array of AnalyticsEventDTOs.
   * @param playerId - Optional ID of the player associated with the events.
   * @returns A promise that resolves when the events have been processed/forwarded.
   */
  ingestEventBatch(events: AnalyticsEventDTO[], playerId?: string): Promise<void>;
}