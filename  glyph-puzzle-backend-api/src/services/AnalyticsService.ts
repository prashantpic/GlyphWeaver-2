import { IAnalyticsService } from './interfaces/IAnalyticsService';
import { IExternalApiService } from './interfaces/IExternalApiService';
// Assuming DTOs are in src/api/analytics/dtos
import { AnalyticsEventBatchRequestDTO, AnalyticsEventDTO } from '../api/analytics/dtos';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { environmentConfig } from '../config';

// REQ-AMOT-001, REQ-AMOT-002, REQ-AMOT-003

export class AnalyticsService implements IAnalyticsService {
    constructor(
        private externalApiService: IExternalApiService
    ) {}

    async ingestEventBatch(playerId: string, batchRequest: AnalyticsEventBatchRequestDTO): Promise<void> {
        const { events } = batchRequest;
        if (!events || events.length === 0) {
            logger.warn(`Player ${playerId} submitted an empty analytics event batch.`);
            // Optionally throw an error or just return
            // throw new ApiError('Analytics event batch cannot be empty.', 400);
            return;
        }

        logger.info(`Ingesting analytics event batch for player ${playerId}, ${events.length} events.`);

        // Basic validation on event structure (can be more comprehensive)
        for (const event of events) {
            if (!event.eventName || !event.timestamp) {
                logger.error(`Invalid event structure in batch from player ${playerId}: ${JSON.stringify(event)}`);
                throw new ApiError('Invalid event structure in batch.', 400);
            }
            // Add player ID to each event if not already present from client, or for server-side enrichment
            event.playerId = playerId;
            // Ensure timestamp is valid ISO string or convert if needed
            if (typeof event.timestamp === 'number') {
                event.timestamp = new Date(event.timestamp).toISOString();
            }
        }
        
        const analyticsPipelineEndpoint = environmentConfig.analyticsPipelineEndpoint;
        if (!analyticsPipelineEndpoint) {
            logger.error('Analytics pipeline endpoint is not configured. Cannot forward events.');
            // Depending on requirements, could buffer events or drop them.
            // For now, throw an error indicating server misconfiguration.
            throw new ApiError('Analytics service is not properly configured.', 503);
        }

        try {
            // Forward the enriched event batch to the analytics pipeline
            // The external API service handles actual HTTP communication and retries if configured.
            await this.externalApiService.post(analyticsPipelineEndpoint, { events }); // Sending as { events: [...] }
            logger.info(`Successfully forwarded ${events.length} analytics events for player ${playerId} to pipeline.`);
        } catch (error: any) {
            logger.error(`Failed to forward analytics events for player ${playerId} to pipeline: ${error.message}`, { error });
            // Decide on error handling: retry (if ExternalApiService doesn't handle it), queue, or log and drop.
            // For now, rethrow as an ApiError to indicate the ingestion partially failed at forwarding.
            throw new ApiError('Failed to process analytics batch due to upstream error.', 502, true, { originalError: error.message });
        }
    }
}