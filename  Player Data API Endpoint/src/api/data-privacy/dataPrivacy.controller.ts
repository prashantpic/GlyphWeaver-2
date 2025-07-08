import { Request, Response, NextFunction } from 'express';
import { DataPrivacyService } from './dataPrivacy.service';

/**
 * The presentation layer for data privacy requests, managing HTTP interactions
 * and invoking the appropriate service logic.
 */
export class DataPrivacyController {

    constructor(private dataPrivacyService: DataPrivacyService) {}

    /**
     * Handles a POST request to initiate a data access/export request.
     */
    public async handleRequestAccess(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const result = await this.dataPrivacyService.requestDataExport(playerId, req.ip);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Handles a POST request to initiate a data deletion request.
     */
    public async handleRequestDeletion(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const result = await this.dataPrivacyService.requestDataDeletion(playerId, req.ip);
            res.status(202).json(result);
        } catch (error) {
            next(error);
        }
    }
}