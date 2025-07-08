import { Request, Response, NextFunction } from 'express';
import { IAnalyticsIngestionService } from '../../application/services/analytics-ingestion.service';
import { IngestEventsRequestDto } from '../../application/dtos/ingest-events-request.dto';

/**
 * Controller for handling HTTP requests related to analytics.
 * It acts as the bridge between the API (Presentation) layer and the Application Services layer.
 */
export class AnalyticsController {
  private readonly analyticsIngestionService: IAnalyticsIngestionService;

  /**
   * Constructs a new AnalyticsController.
   * @param analyticsIngestionService The service responsible for the core business logic.
   */
  constructor(analyticsIngestionService: IAnalyticsIngestionService) {
    this.analyticsIngestionService = analyticsIngestionService;
  }

  /**
   * Handles the ingestion of a batch of analytics events.
   * This method is defined as an arrow function to ensure `this` is correctly bound
   * when it's used as an Express route handler.
   * @param req - The Express Request object. The body has been validated by middleware.
   * @param res - The Express Response object.
   * @param next - The Express NextFunction for error handling.
   */
  public ingestEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // The request body has already been validated and typed by the validation middleware.
      const ingestRequest = req.body as IngestEventsRequestDto;
      
      // Delegate the business logic to the application service.
      await this.analyticsIngestionService.ingestEvents(ingestRequest);
      
      // Respond with 202 Accepted. This status code is appropriate because it indicates
      // that the request has been accepted for processing, but the processing may not
      // have been completed yet. This is forward-compatible with an asynchronous
      // processing model (e.g., using a message queue).
      res.status(202).send();
    } catch (error) {
      // If any error occurs during processing (e.g., a database error),
      // pass it to the global error handler middleware.
      next(error);
    }
  };
}