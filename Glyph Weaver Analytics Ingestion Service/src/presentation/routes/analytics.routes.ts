import { Router } from 'express';
import { AnalyticsController } from '../controllers/Analytics.controller';
import { validateRequest } from '../middleware/validator.middleware';
import { IngestEventsDtoSchema } from '../../application/dtos/IngestEvents.dto';

/**
 * Creates and configures the Express router for all analytics-related endpoints.
 *
 * @param {AnalyticsController} analyticsController - The controller handling the endpoint logic.
 * @returns {Router} The configured Express router.
 */
export const createAnalyticsRouter = (analyticsController: AnalyticsController): Router => {
  const router = Router();

  /**
   * @route POST /events
   * @description Ingests a batch of analytics events from the client.
   * @header {string} X-Session-ID - Required. A unique ID for the game session.
   * @body {IngestEventsDto} - The batch of events.
   * @response 202 - Accepted. The server has received the request for processing.
   * @response 400 - Bad Request. The request body or headers are invalid.
   */
  router.post(
    '/events',
    validateRequest({ body: IngestEventsDtoSchema }),
    analyticsController.ingestEvents
  );

  return router;
};