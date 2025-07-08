import { Request, Response, NextFunction } from 'express';
import { ProceduralLevelService } from '../../../services/procedural-level.service';
import { RegisterLevelDto } from './dto/register-level.dto';
import { LevelInstanceResponseDto } from './dto/level-instance.response.dto';

/**
 * Controller that handles HTTP requests for the procedural levels resource.
 * It uses the application service to perform business logic and formats the
 * HTTP response according to the API specification.
 */
export class ProceduralLevelsController {
  /**
   * @param proceduralLevelService Injected service for handling business logic.
   */
  constructor(private readonly proceduralLevelService: ProceduralLevelService) {}

  /**
   * Handles the request to register a new procedural level instance.
   * It extracts data from the request, delegates to the service layer,
   * and sends back the appropriate response.
   *
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The next middleware function, used for error handling.
   */
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const playerId = req.user?.playerId;
      if (!playerId) {
        // This should theoretically be caught by auth middleware, but it's a good safeguard.
        res.status(401).json({ message: 'Unauthorized: Player ID missing from token.' });
        return;
      }

      const registerLevelDto: RegisterLevelDto = req.body;

      const proceduralLevelId = await this.proceduralLevelService.registerLevel(
        registerLevelDto,
        playerId
      );

      const responseDto: LevelInstanceResponseDto = { proceduralLevelId };

      res.status(201).json(responseDto);
    } catch (error) {
      // Pass any errors to the global error handler middleware.
      next(error);
    }
  }
}