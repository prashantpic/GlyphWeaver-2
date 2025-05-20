import { Router } from 'express';
import { analyticsController } from '../controllers/AnalyticsController';
import { validate } from '../middlewares/validator';
import { analyticsIngestionPayloadSchema } from '../validators/analyticsEvent.validator';
import { consentCheckMiddleware } from '../middlewares/consentCheck.middleware';
// import { apiKeyAuthMiddleware } from '../middlewares/apiKeyAuth.middleware'; // Optional API key check

const router = Router();

/**
 * @swagger
 * /api/analytics/v1/events:
 *   post:
 *     summary: Ingest analytics events or batches.
 *     description: Receives single analytics events or arrays of events for processing and storage. Includes consent check.
 *     tags:
 *       - Analytics
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/AnalyticsEvent'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/AnalyticsEvent'
 *     responses:
 *       202:
 *         description: Accepted - The events have been received for processing.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Received 5 analytics events for processing.
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError' # If API key auth is used
 *       403:
 *         $ref: '#/components/responses/ConsentError'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post(
  '/v1/events', // Path relative to where this router is mounted (e.g. /api/analytics)
  // apiKeyAuthMiddleware, // Apply API key check if needed. Ensure it exists or implement it.
  consentCheckMiddleware, // REQ-AMOT-001: Check consent before validation/processing
  validate(analyticsIngestionPayloadSchema, 'body'), // Validate payload structure
  analyticsController.handleIngestEvents
);

// Swagger definitions (should be moved to a dedicated swagger setup if using OpenAPI specs extensively)
/**
 * @swagger
 * components:
 *   schemas:
 *     AnalyticsEvent:
 *       type: object
 *       required:
 *         - eventName
 *         - timestamp
 *         - userId
 *         - sessionId
 *       properties:
 *         eventName:
 *           type: string
 *           description: Unique name identifying the event.
 *           example: level_completed
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: ISO 8601 timestamp of event on client.
 *           example: "2023-10-27T10:00:00.000Z"
 *         userId:
 *           type: string
 *           description: Unique identifier for the user.
 *           example: "user-12345"
 *         sessionId:
 *           type: string
 *           description: Unique identifier for the session.
 *           example: "session-abcde"
 *         eventProperties:
 *           type: object
 *           description: Key-value pairs specific to the event.
 *           additionalProperties: true
 *           example:
 *             levelId: 101
 *             score: 1500
 *         metadata:
 *           type: object
 *           description: Key-value pairs for context metadata.
 *           additionalProperties: true
 *           example:
 *             appVersion: "1.1.0"
 *             deviceOS: "iOS"
 *         userConsentStatus:
 *           type: string
 *           enum: [granted, denied, unknown]
 *           description: Client-provided consent status (optional). Server will determine final based on middleware.
 *           example: "granted"
 *   responses:
 *     ValidationError:
 *       description: Bad Request - Request payload validation failed.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               statusCode:
 *                 type: integer
 *                 example: 400
 *               message:
 *                 type: string
 *                 example: Request body validation failed
 *               details:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     path:
 *                       type: string
 *                       example: body.eventName
 *                     message:
 *                       type: string
 *                       example: Required
 *     UnauthorizedError:
 *       description: Unauthorized - Invalid or missing API key/authentication.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               statusCode:
 *                 type: integer
 *                 example: 401
 *               message:
 *                 type: string
 *                 example: Invalid API key or authentication token
 *     ConsentError:
 *       description: Forbidden - User consent not granted for analytics tracking.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               statusCode:
 *                 type: integer
 *                 example: 403
 *               message:
 *                 type: string
 *                 example: User consent not granted for analytics tracking
 *     InternalError:
 *       description: Internal Server Error - An unexpected server error occurred.
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: error
 *               statusCode:
 *                 type: integer
 *                 example: 500
 *               message:
 *                 type: string
 *                 example: An unexpected error occurred.
 */

export default router;