import { Request, Response, NextFunction } from 'express';
import { ProgressService, SyncProgressDto } from './progress.service';

/**
 * The presentation layer component for the player progress resource.
 * It manages HTTP requests and responses, interacting with the ProgressService.
 */
export class ProgressController {
  
  constructor(private progressService: ProgressService) {}

  /**
   * Handles the request to retrieve all progress for the authenticated player.
   */
  public async handleGetFullProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const playerId = req.user!.id;
      const progress = await this.progressService.getFullProgress(playerId);
      res.status(200).json(progress);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles the request to synchronize a batch of level progress from the client.
   */
  public async handleSynchronizeProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const playerId = req.user!.id;
      const syncData: SyncProgressDto = req.body;
      const updatedProgress = await this.progressService.synchronizeProgress(playerId, syncData);
      res.status(200).json(updatedProgress);
    } catch (error) {
      next(error);
    }
  }
}