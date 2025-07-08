import { Request, Response, NextFunction } from 'express';
import { ConfigurationService } from '../../../application/services/configuration.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

/**
 * @file Handles the web layer for configuration management, translating HTTP requests into actions within the application and returning results as JSON.
 * @namespace GlyphWeaver.Backend.System.Presentation.HTTP.Controllers
 */

/**
 * @class ConfigurationController
 * @description Express controller for handling game configuration related HTTP requests.
 * @pattern MVC-Controller
 */
export class ConfigurationController {
  constructor(private readonly configService: ConfigurationService) {}

  /**
   * Handles the request to get all configurations.
   * @param req Express Request object.
   * @param res Express Response object.
   * @param next Express NextFunction object.
   */
  public getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const configs = await this.configService.getAllConfigurations();
      // Map to a simpler response object if needed, but returning the full entity is fine for admin purposes.
      res.status(200).json(configs);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the request to get a single configuration by key.
   * @param req Express Request object.
   * @param res Express Response object.
   * @param next Express NextFunction object.
   */
  public getByKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const value = await this.configService.getConfigurationByKey(key);
      res.status(200).json({ key, value });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the request to update a configuration.
   * @param req Express Request object, authenticated.
   * @param res Express Response object.
   * @param next Express NextFunction object.
   */
  public update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const actorId = req.user?.userId;
      const ipAddress = req.ip;

      if (!actorId) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
      }
      
      if (value === undefined) {
        res.status(400).json({ message: 'Request body must contain a "value" field.' });
        return;
      }

      await this.configService.updateConfiguration(key, value, actorId, ipAddress);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}