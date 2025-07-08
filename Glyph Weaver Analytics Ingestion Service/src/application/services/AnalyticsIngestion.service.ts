import { IAnalyticsEventRepository } from '../../domain/repositories/IAnalyticsEventRepository';
import { AnalyticsEvent } from '../../domain/models/AnalyticsEvent';
import { IngestEventsDto } from '../dtos/IngestEvents.dto';
import { randomUUID } from 'crypto';

/**
 * Core application service that orchestrates the business logic for ingesting analytics events.
 * It is responsible for transforming, enriching, and persisting the data.
 */
export class AnalyticsIngestionService {
  /**
   * Initializes the service with its dependencies.
   * @param {IAnalyticsEventRepository} analyticsEventRepository - The repository for data persistence.
   */
  constructor(
    private readonly analyticsEventRepository: IAnalyticsEventRepository,
    // A GeoIP service could be injected here for enrichment.
    // private readonly geoIpService: IGeoIpService,
  ) {}

  /**
   * Processes a batch of incoming events, enriches them with server-side data,
   * and passes them to the repository for persistence.
   *
   * @param {IngestEventsDto} ingestDto - The validated data transfer object from the client.
   * @param {object} metadata - Server-side metadata associated with the request.
   * @param {string} metadata.ipAddress - The client's IP address.
   * @param {string | undefined} metadata.userId - The authenticated user's ID, if available.
   * @param {string} metadata.sessionId - The client's session ID.
   * @returns {Promise<void>}
   */
  public async ingestEventBatch(
    ingestDto: IngestEventsDto,
    metadata: { ipAddress: string; userId?: string; sessionId: string }
  ): Promise<void> {
    const serverTimestamp = new Date();
    // Optional: Geo-IP lookup could happen here.
    // const geo = await this.geoIpService.lookup(metadata.ipAddress);

    const eventsToSave: AnalyticsEvent[] = ingestDto.events.map(e => ({
      id: randomUUID(),
      sessionId: metadata.sessionId,
      userId: metadata.userId || null,
      eventName: e.eventName,
      clientTimestamp: new Date(e.clientTimestamp),
      serverTimestamp,
      clientVersion: e.clientVersion,
      payload: e.payload, // Further sanitization or validation of the payload can be added here if needed.
      geo: null, // Populate with `geo` object if the service is used.
    }));

    await this.analyticsEventRepository.addBatch(eventsToSave);
  }
}