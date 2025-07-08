import { Response, NextFunction } from 'express';
import { PlayerDataRequestService } from '../../../application/services/player-data-request.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * @file Handles the web layer for administrative actions related to player data privacy, such as initiating data access or deletion jobs.
 * @namespace GlyphWeaver.Backend.System.Presentation.HTTP.Controllers
 */

/**
 * @class PlayerDataController
 * @description Express controller to handle administrative HTTP requests related to player data.
 * @pattern MVC-Controller
 */
export class PlayerDataController {
  constructor(private readonly playerDataRequestService: PlayerDataRequestService) {}

  /**
   * Handles a request to initiate a player data deletion process.
   * @param req Express Request object, authenticated.
   * @param res Express Response object.
   * @param next Express NextFunction object.
   */
  public requestDeletion = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playerId } = req.body;
      const actorId = req.user?.userId;
      const ipAddress = req.ip;

      if (!actorId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
      }
      if (!playerId) {
        res.status(400).json({ message: 'Request body must contain a "playerId" field.' });
        return;
      }

      const result = await this.playerDataRequestService.processDataDeletionRequest(playerId, actorId, ipAddress);
      res.status(result.success ? 202 : 500).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles a request to initiate a player data access process.
   * @param req Express Request object, authenticated.
   * @param res Express Response object.
   * @param next Express NextFunction object.
   */
  public requestAccess = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { playerId } = req.body;
      const actorId = req.user?.userId;
      const ipAddress = req.ip;

      if (!actorId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
      }
      if (!playerId) {
        res.status(400).json({ message: 'Request body must contain a "playerId" field.' });
        return;
      }

      const result = await this.playerDataRequestService.processDataAccessRequest(playerId, actorId, ipAddress);
      
      if(result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }

    } catch (error) {
      next(error);
    }
  };
}