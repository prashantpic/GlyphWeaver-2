import { Request, Response, NextFunction } from 'express';
import { AnalyticsIngestionService } from '../../application/services/AnalyticsIngestion.service';
import { IngestEventsDto } from '../../application/dtos/IngestEvents.dto';

/**
 * Controller for handling HTTP requests related to analytics ingestion.
 * It extracts data from the request and delegates the business logic to the application service.
 */
export class AnalyticsController {
  /**
   * @param {AnalyticsIngestionService} analyticsIngestionService - The service responsible for the core ingestion logic.
   */
  constructor(private readonly analyticsIngestionService: AnalyticsIngestionService) {}

  /**
   * Express request handler for ingesting a batch of analytics events.
   * Adheres to a "fire-and-forget" pattern.
   */
  public ingestEvents = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dto = req.body as IngestEventsDto;
      const sessionId = req.headers['x-session-id'];

      if (typeof sessionId !== 'string' || !sessionId) {
        res.status(400).json({ message: 'Header "X-Session-ID" is required.' });
        return;
      }
      
      const metadata = {
        ipAddress: req.ip,
        // Assumes an optional authentication middleware might populate `req.user`.
        userId: (req as any).user?.id,
        sessionId,
      };

      // Fire-and-forget: We start the async operation but do not wait for it to complete.
      // This allows us to send a `202 Accepted` response immediately, minimizing
      // client-side latency and impact on game performance. Error handling for the
      // async operation is done within the service/repository layers (e.g., logging).
      this.analyticsIngestionService.ingestEventBatch(dto, metadata);
      
      res.status(202).send();
    } catch (error) {
      // Catch synchronous errors (e.g., header parsing) and pass to the global error handler.
      next(error);
    }
  };
}