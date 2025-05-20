import { Request, Response, NextFunction } from 'express';
import { IIAPValidationService }_ from '../../services/interfaces/IIAPValidationService';
import { ValidateReceiptRequestDTO }_ from './dtos/ValidateReceipt.request.dto';
import { ValidationResponseDTO }_ from './dtos/Validation.response.dto';

export class IAPValidationController {
    constructor(private iapValidationService: IIAPValidationService) {}

    /**
     * @swagger
     * /iap/validate-receipt:
     *   post:
     *     summary: Validate an IAP receipt and grant items
     *     tags: [IAP]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ValidateReceiptRequestDTO'
     *     responses:
     *       200:
     *         description: Receipt validation result
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ValidationResponseDTO'
     *       400:
     *         description: Invalid input or receipt data
     *       401:
     *         description: Unauthorized
     *       402:
     *         description: Payment required (validation failed)
     */
    public async validateReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            const { platform, receiptData, productId, transactionId } = req.body as ValidateReceiptRequestDTO;
            const validationResponse: ValidationResponseDTO = await this.iapValidationService.validateReceipt(
                playerId,
                platform,
                receiptData,
                productId,
                transactionId
            );
            res.status(200).json(validationResponse);
        } catch (error) {
            next(error);
        }
    }
}