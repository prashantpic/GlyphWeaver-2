import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { ingestEventsSchema } from '../validation/analytics.validator';
import { IAnalyticsIngestionService } from '../../application/services/analytics-ingestion.service';

/**
 * Creates and configures the Express router for all analytics-related API endpoints.
 * This factory function pattern allows for dependency injection of the service layer,
 * making the router and its dependencies easier to test and manage.
 *
 * @param analyticsIngestionService The service instance that handles analytics logic.
 * @returns A configured Express.Router instance.
 */
export const createAnalyticsRouter = (analyticsIngestionService: IAnalyticsIngestionService): Router => {
  const router = Router();
  const analyticsController = new AnalyticsController(analyticsIngestionService);

  /**
   * @route POST /events
   * @description Endpoint for ingesting a batch of analytics events.
   * @access public
   * @body {IngestEventsRequestDto} The batch of events to ingest.
   * @response 202 - Accepted. The request has been accepted for processing.
   * @response 400 - Bad Request. The request body failed validation.
   * @response 500 - Internal Server Error. An unexpected error occurred.
   */
  router.post(
    '/events',
    validateRequest(ingestEventsSchema), // 1. Validate the request body using the Joi schema.
    analyticsController.ingestEvents      // 2. If validation passes, hand off to the controller method.
  );

  return router;
};