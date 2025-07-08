import { Router, Request, Response, NextFunction } from 'express';
import { IapController } from './iap.controller';
import { validateIapValidator } from './validators/validateIap.validator';
import { Schema } from 'joi';

// --- Placeholder Middleware ---
// In a real application, these would be in their own files.

/**
 * A placeholder for a real authentication middleware.
 * It would verify a JWT from the Authorization header and attach the user payload to req.user.
 */
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Mocking a successful authentication for demonstration.
  req.user = { id: 'mock_user_123' }; 
  next();
};

/**
 * A generic validation middleware that uses a Joi schema.
 */
const validationMiddleware = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      res.status(400).json({ success: false, message: error.details[0].message });
    } else {
      next();
    }
  };
};

// --- Dependency Instantiation ---
// In a real app with a DI container, this would be handled automatically.
import { IapValidationService } from '../application/iap.service';
import { PlatformGatewayFactory } from '../infrastructure/gateways/platform.gateway';
import { AppleIapGateway } from '../infrastructure/gateways/apple.gateway';
import { GoogleIapGateway } from '../infrastructure/gateways/google.gateway';
import { IapTransactionRepository } from '../../core/repositories/iapTransaction.repository';
import { PlayerInventoryRepository } from '../../core/repositories/playerInventory.repository';
import { AuditLogService } from '../../core/services/audit.service';

const appleGateway = new AppleIapGateway();
const googleGateway = new GoogleIapGateway();
const platformGatewayFactory = new PlatformGatewayFactory(appleGateway, googleGateway);
const iapTransactionRepository = new IapTransactionRepository();
const playerInventoryRepository = new PlayerInventoryRepository();
const auditLogService = new AuditLogService();
const iapValidationService = new IapValidationService(platformGatewayFactory, iapTransactionRepository, playerInventoryRepository, auditLogService);
const iapController = new IapController(iapValidationService);

// --- Router Definition ---

const iapRouter = Router();

/**
 * @route   POST /api/iap/validate
 * @desc    Validates an in-app purchase receipt and grants items.
 * @access  Private (requires authentication)
 * 
 * @middleware authMiddleware - Ensures the user is authenticated and attaches user ID to the request.
 * @middleware validationMiddleware - Validates the request body against the Joi schema.
 */
iapRouter.post(
  '/validate',
  authMiddleware,
  validationMiddleware(validateIapValidator),
  (req: Request, res: Response, next: NextFunction) => iapController.validate(req, res, next)
);

export default iapRouter;