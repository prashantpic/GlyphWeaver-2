import { Request, Response, NextFunction } from 'express';
import { IAnalyticsService }_ from '../../services/interfaces/IAnalyticsService';
import { AnalyticsEventBatchRequestDTO }_ from './dtos/AnalyticsEventBatch.request.dto';

export class AnalyticsController {
    constructor(private analyticsService: IAnalyticsService) {}

    /**
     * @swagger
     * /analytics:
     *   post:
     *     summary: Submit a batch of analytics events
     *     tags: [Analytics]
     *     security:
     *       - bearerAuth: [] # To associate events with a user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AnalyticsEventBatchRequestDTO'
     *     responses:
     *       201:
     *         description: Analytics events batch accepted
     *       400:
     *         description: Invalid input or event structure
     *       401:
     *         description: Unauthorized
     */
    public async submitAnalyticsBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // req.user.id could be used by AnalyticsService to associate events with the user
            // const userId = req.user!.id;
            const { events } = req.body as AnalyticsEventBatchRequestDTO;
            // The service might enrich events with userId if needed.
            await this.analyticsService.ingestEventBatch(events, req.user!.id);
            res.status(201).send();
        } catch (error) {
            next(error);
        }
    }
}