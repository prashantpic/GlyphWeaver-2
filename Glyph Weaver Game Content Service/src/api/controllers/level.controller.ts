import { Request, Response, NextFunction } from 'express';
import { LevelService } from '@/application/services/level.service';
import mongoose from 'mongoose';

/**
 * @class LevelController
 * @description Handles HTTP requests for level-related endpoints.
 */
export class LevelController {
    private readonly levelService: LevelService;

    constructor(levelService: LevelService) {
        this.levelService = levelService;
    }

    /**
     * Handles the request to get a level by its unique ID.
     * @param req The Express request object.
     * @param res The Express response object.
     * @param next The Express next middleware function.
     */
    public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                res.status(400).json({ status: 'error', message: 'Invalid level ID format.' });
                return;
            }

            const level = await this.levelService.getLevelDetails(id);
            if (!level) {
                res.status(404).json({ status: 'error', message: 'Level not found.' });
                return;
            }
            res.status(200).json(level);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Handles the request to get all levels for a specific zone.
     * @param req The Express request object.
     * @param res The Express response object.
     * @param next The Express next middleware function.
     */
    public getByZone = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { zoneId } = req.params;
            if (!mongoose.Types.ObjectId.isValid(zoneId)) {
                res.status(400).json({ status: 'error', message: 'Invalid zone ID format.' });
                return;
            }

            const levels = await this.levelService.getLevelsForZone(zoneId);
            res.status(200).json(levels);
        } catch (error) {
            next(error);
        }
    };
}