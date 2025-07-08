import { Request, Response, NextFunction } from 'express';
import { SystemHealthService } from '../../../application/services/system-health.service';

/**
 * @file Handles the web layer for the health check endpoint, providing a snapshot of the system's operational status.
 * @namespace GlyphWeaver.Backend.System.Presentation.HTTP.Controllers
 */

/**
 * @class HealthController
 * @description Express controller for the system health check endpoint.
 * @pattern MVC-Controller
 */
export class HealthController {
  constructor(private readonly systemHealthService: SystemHealthService) {}

  /**
   * Handles the request to check system health.
   * @param req Express Request object.
   * @param res Express Response object.
   * @param next Express NextFunction object.
   */
  public checkHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const healthStatus = await this.systemHealthService.getSystemHealth();
      const statusCode = healthStatus.overallStatus === 'UP' ? 200 : 503;
      res.status(statusCode).json(healthStatus);
    } catch (error) {
      next(error);
    }
  };
}