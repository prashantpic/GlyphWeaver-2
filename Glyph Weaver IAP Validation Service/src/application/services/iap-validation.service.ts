import { ValidateReceiptDto } from '../../api/v1/dtos/validate-receipt.dto';
import { IAPTransaction } from '../../domain/iap-transaction/iap-transaction.aggregate';
import { IIAPTransactionRepository } from '../../domain/iap-transaction/iap-transaction.repository.interface';
import { IPlayerServiceGateway } from '../interfaces/player-service.gateway.interface';
import { IPlatformValidatorGateway } from '../interfaces/platform-validator.gateway.interface';

/**
 * A structured response for the application service layer.
 */
export interface ServiceResponse {
    success: boolean;
    statusCode: number;
    message: string;
    data?: any;
}

/**
 * @class IAPValidationService
 * @description The core application service that orchestrates the entire IAP validation and fulfillment workflow.
 * It coordinates domain models, repositories, and external service gateways to execute the business use case.
 */
export class IAPValidationService {
    private validators: { [key: string]: IPlatformValidatorGateway };

    constructor(
        private readonly transactionRepo: IIAPTransactionRepository,
        private readonly playerServiceGateway: IPlayerServiceGateway,
        // Using a map for validators makes it easy to extend with new platforms.
        validators: { ios: IPlatformValidatorGateway; android: IPlatformValidatorGateway }
    ) {
        this.validators = validators;
    }

    /**
     * Orchestrates the complete IAP validation and fulfillment process.
     * @param dto The data transfer object from the API layer.
     * @returns A promise resolving to a structured service response.
     */
    public async validateAndFulfillPurchase(dto: ValidateReceiptDto): Promise<ServiceResponse> {
        // 1. Get the correct platform validator
        const validator = this.validators[dto.platform];
        if (!validator) {
            return { success: false, statusCode: 400, message: 'Invalid platform specified.' };
        }

        // 2. Validate the receipt with the external platform
        const validationResult = await validator.validateReceipt(dto.receiptData, dto.sku);
        if (!validationResult.isValid || !validationResult.transactionId || !validationResult.purchaseDate) {
            return { success: false, statusCode: 402, message: 'Receipt is invalid or expired.', data: validationResult.rawResponse };
        }

        // 3. Check for duplicate transactions to prevent replay attacks
        const existingTransaction = await this.transactionRepo.findByPlatformTransactionId(
            dto.platform,
            validationResult.transactionId,
        );

        if (existingTransaction && existingTransaction.isAlreadyProcessed()) {
            return { success: false, statusCode: 409, message: 'This transaction has already been processed.' };
        }

        // 4. Create and persist the initial transaction record
        const transaction = IAPTransaction.create({
            userId: dto.userId,
            sku: validationResult.sku!, // We know this is valid from the check above
            platform: dto.platform,
            platformTransactionId: validationResult.transactionId,
            purchaseDate: validationResult.purchaseDate,
        });

        try {
            await this.transactionRepo.create(transaction);
        } catch (error: any) {
             // Handle potential race condition where another process validated the same receipt
            if (error.code === 11000) { // MongoDB duplicate key error
                return { success: false, statusCode: 409, message: 'This transaction has already been processed (race condition).' };
            }
            console.error('Failed to create initial transaction record:', error);
            return { success: false, statusCode: 500, message: 'Failed to save initial transaction record.' };
        }
        
        // 5. Mark as validated and save state
        transaction.markAsValidated(validationResult.rawResponse);
        await this.transactionRepo.save(transaction);

        // 6. Fulfill the purchase by crediting the player
        const fulfillmentResult = await this.playerServiceGateway.creditPlayer(
            dto.userId,
            dto.sku,
            transaction.id
        );

        // 7. Handle fulfillment outcome
        if (!fulfillmentResult.success) {
            // This is a critical error. The player was charged but did not get their item.
            // Mark the transaction as 'error' for manual intervention/retry.
            transaction.markAsError(fulfillmentResult.details);
            await this.transactionRepo.save(transaction);
            console.error(`CRITICAL: Fulfillment failed for transaction ${transaction.id}. Details: ${JSON.stringify(fulfillmentResult.details)}`);
            return { success: false, statusCode: 500, message: 'Purchase was validated but failed to be fulfilled. Please contact support.' };
        }

        // 8. Mark as fulfilled and save final state
        transaction.markAsFulfilled(fulfillmentResult.details);
        await this.transactionRepo.save(transaction);
        
        return {
            success: true,
            statusCode: 200,
            message: 'Purchase validated and fulfilled successfully.',
            data: {
                transactionId: transaction.id,
                fulfillmentDetails: fulfillmentResult.details,
            },
        };
    }
}