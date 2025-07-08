import { Request, Response, NextFunction } from 'express';
import { IapValidationService } from '../application/iap.service';
import { ValidateIapRequestDto } from './dtos/validateIap.dto';

// A mock user object attached by an authentication middleware.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

/**
 * @class IapController
 * @description Handles incoming HTTP requests for IAP validation. It acts as the bridge
 * between the web framework (Express) and the core application logic.
 */
export class IapController {
  // The service is injected via the constructor to promote loose coupling.
  constructor(private readonly _iapValidationService: IapValidationService) {}

  /**
   * Handles the POST /iap/validate request.
   * It extracts user data, validates the request body (via middleware),
   * invokes the core IAP service, and sends an appropriate HTTP response.
   * @param {Request} req - The Express request object.
   * @param {Response} res - The Express response object.
   * @param {NextFunction} next - The Express next middleware function.
   * @returns {Promise<void>}
   */
  public async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Auth middleware should have populated req.user
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Authentication required.' });
        return;
      }
      
      // 2. Cast the validated request body to our DTO.
      const requestDto = req.body as ValidateIapRequestDto;

      // 3. Call the application service to perform the core business logic.
      const result = await this._iapValidationService.validatePurchase(userId, requestDto);
      
      // 4. Send the appropriate response based on the service's result.
      if (result.success) {
        res.status(200).json(result);
      } else {
        // Use 400 for client-side errors like invalid receipt or replay attacks.
        res.status(400).json(result);
      }
    } catch (error) {
      // 5. Pass any unexpected errors to the global error handler middleware.
      next(error);
    }
  }
}