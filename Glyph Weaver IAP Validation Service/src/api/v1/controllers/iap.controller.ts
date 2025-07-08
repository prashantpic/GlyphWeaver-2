import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { IAPValidationService } from '../../../application/services/iap-validation.service';
import { ValidateReceiptDto } from '../dtos/validate-receipt.dto';

/**
 * @class IAPController
 * @description The Express.js controller for handling all IAP-related HTTP requests.
 * It serves as the entry point for the API, responsible for receiving requests,
 * validating the request body (DTO), and delegating the core business logic
 to the application service.
 */
export class IAPController {
    /**
     * @param iapValidationService The application service that orchestrates the IAP logic.
     */
    constructor(private readonly iapValidationService: IAPValidationService) {}

    /**
     * @method validatePurchase
     * @description Handles the 'POST /api/v1/iap/validate' request.
     * It validates the request payload and passes it to the IAPValidationService
     * to perform the actual validation and fulfillment. It then formats the
     * HTTP response based on the service's result.
     * @param req - The Express Request object.
     * @param res - The Express Response object.
     * @param next - The Express NextFunction for error handling.
     */
    public async validatePurchase(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // 1. Transform plain request body to DTO instance
            const dto = plainToInstance(ValidateReceiptDto, req.body);
            
            // 2. Validate the DTO
            const errors = await validate(dto);
            if (errors.length > 0) {
                // If validation fails, send a 400 Bad Request response with details.
                res.status(400).json({ message: 'Validation failed', errors });
                return;
            }
            
            // 3. Delegate to the application service
            const result = await this.iapValidationService.validateAndFulfillPurchase(dto);

            // 4. Map service layer response to HTTP response
            if (!result.success) {
                res.status(result.statusCode).json({ message: result.message, data: result.data });
                return;
            }

            res.status(200).json({
                message: result.message,
                data: result.data,
            });
        } catch (error) {
            // Pass any unexpected errors to the global error handler middleware
            next(error);
        }
    }
}