import { IRawAnalyticsEventRepository } from '../../infrastructure/data/repositories/raw-analytics-event.repository';
import { IngestEventsRequestDto } from '../dtos/ingest-events-request.dto';

/**
 * Interface for the Analytics Ingestion Service.
 * This defines the contract for the application's core business logic related
 * to ingesting analytics events.
 */
export interface IAnalyticsIngestionService {
  /**
   * Processes and persists a batch of analytics events.
   * @param ingestRequest The validated DTO of events to be ingested.
   * @returns A promise that resolves when the ingestion process is initiated.
   */
  ingestEvents(ingestRequest: IngestEventsRequestDto): Promise<void>;
}

/**
 * Implements the core application logic for the analytics ingestion use case.
 * It orchestrates the flow of data from the API layer to the data access layer.
 */
export class AnalyticsIngestionService implements IAnalyticsIngestionService {
  private readonly rawAnalyticsEventRepository: IRawAnalyticsEventRepository;

  /**
   * Constructs a new AnalyticsIngestionService.
   * @param rawAnalyticsEventRepository The repository responsible for data persistence.
   */
  constructor(rawAnalyticsEventRepository: IRawAnalyticsEventRepository) {
    this.rawAnalyticsEventRepository = rawAnalyticsEventRepository;
  }

  /**
   * Processes a validated batch of analytics events by delegating persistence
   * to the repository.
   * @param ingestRequest The validated DTO of events to be ingested.
   */
  public async ingestEvents(ingestRequest: IngestEventsRequestDto): Promise<void> {
    // Note: This is the primary decoupling point in the architecture.
    // In a future version, the implementation of this method could be swapped out
    // to push events to a message queue (e.g., AWS SQS, RabbitMQ, Kafka)
    // instead of calling the repository directly. This change would be transparent
    // to the controller and other parts of the application, which only depend on
    // the IAnalyticsIngestionService interface.

    await this.rawAnalyticsEventRepository.saveBatch(ingestRequest);
  }
}