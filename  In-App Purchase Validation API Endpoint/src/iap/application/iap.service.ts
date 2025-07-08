import { IapTransactionRepository } from '../../core/repositories/iapTransaction.repository';
import { PlayerInventoryRepository } from '../../core/repositories/playerInventory.repository';
import { IAuditLogService } from '../../core/services/audit.service';
import { PlatformGatewayFactory } from '../infrastructure/gateways/platform.gateway';
import { ValidateIapRequestDto } from '../presentation/dtos/validateIap.dto';
import { IIapTransaction } from '../../core/domain/iapTransaction.model';

// In a real application, this would come from a database or a configuration file.
const itemCatalog: { [key: string]: { keyName: string; quantity: number }[] } = {
  'com.glyphweaver.hints.pack1': [{ keyName: 'consumable_hints', quantity: 10 }],
  'com.glyphweaver.currency.tier1': [{ keyName: 'currency_gems', quantity: 100 }],
  'com.glyphweaver.ad_removal': [{ keyName: 'feature_ad_free', quantity: 1 }],
};

/**
 * @class IapValidationService
 * @description The core application service that orchestrates the entire IAP validation process.
 * It coordinates gateways, repositories, and logging to securely and reliably process a purchase.
 */
export class IapValidationService {
  constructor(
    private readonly platformGatewayFactory: PlatformGatewayFactory,
    private readonly iapTransactionRepository: IapTransactionRepository,
    private readonly playerInventoryRepository: PlayerInventoryRepository,
    private readonly auditLogService: IAuditLogService
  ) {}

  /**
   * Orchestrates the validation of an in-app purchase.
   * This is the main business logic flow.
   * @param {string} userId - The ID of the user making the purchase.
   * @param {ValidateIapRequestDto} requestDto - The DTO containing purchase information.
   * @returns {Promise<{ success: boolean; message: string; }>} The result of the validation process.
   */
  public async validatePurchase(userId: string, requestDto: ValidateIapRequestDto): Promise<{ success: boolean; message: string; }> {
    const { platform, receiptData } = requestDto;
    
    // 1. Get the correct platform gateway
    const gateway = this.platformGatewayFactory.getGateway(platform);

    // 2. Perform external validation with the platform provider (Apple/Google)
    const validationResult = await gateway.validate(receiptData);

    if (!validationResult.isValid || !validationResult.transactionId || !validationResult.sku) {
      await this.auditLogService.logEvent('IAP_VALIDATION_PLATFORM_FAILURE', { userId, platform, reason: 'Invalid receipt', response: validationResult.rawResponse });
      return { success: false, message: 'Receipt validation failed with platform.' };
    }

    // 3. Prevent replay attacks by checking if the transaction has already been processed.
    const existingTransaction = await this.iapTransactionRepository.findByPlatformTransactionId(platform, validationResult.transactionId);
    if (existingTransaction) {
      await this.auditLogService.logEvent('IAP_VALIDATION_REPLAY_ATTEMPT', { userId, platform, platformTransactionId: validationResult.transactionId, existingTransactionId: existingTransaction._id });
      return { success: false, message: 'This transaction has already been processed.' };
    }

    // 4. Retrieve item details from catalog
    const itemsToGrant = itemCatalog[validationResult.sku];
    if (!itemsToGrant) {
        await this.auditLogService.logEvent('IAP_VALIDATION_SKU_NOT_FOUND', { userId, platform, sku: validationResult.sku });
        return { success: false, message: 'The purchased item (SKU) was not found in our system.' };
    }

    // 5. Begin transactional block: Create record, grant items, update record.
    let pendingTransaction: IIapTransaction | null = null;
    try {
      // 5a. Create a PENDING transaction record. This marks the start of processing.
      pendingTransaction = await this.iapTransactionRepository.create({
        userId,
        platform,
        platformTransactionId: validationResult.transactionId,
        sku: validationResult.sku,
        purchaseDate: new Date(), // Use server time for consistency
        validationStatus: 'pending',
        validationResponse: validationResult.rawResponse,
      });

      // 5b. Grant the items to the player's server-authoritative inventory.
      await this.playerInventoryRepository.grantItemsToPlayer(userId, itemsToGrant);
      
      // 5c. If granting is successful, update the transaction status to 'validated'.
      await this.iapTransactionRepository.update(pendingTransaction._id, {
        validationStatus: 'validated',
        itemsGranted: itemsToGrant,
      });

      // 6. Log success and return
      await this.auditLogService.logEvent('IAP_VALIDATION_SUCCESS', { userId, transactionId: pendingTransaction._id, sku: validationResult.sku });
      return { success: true, message: 'Purchase validated successfully.' };

    } catch (error: any) {
      // 7. CATCH BLOCK: Handle any failures during the transactional process.
      console.error(`IAP processing failed for user ${userId}:`, error);
      
      // If a pending transaction was created, mark it as 'failed' for manual review.
      if (pendingTransaction) {
        await this.iapTransactionRepository.update(pendingTransaction._id, { validationStatus: 'failed' });
      }

      await this.auditLogService.logEvent('IAP_VALIDATION_GRANTING_FAILURE', { userId, transactionId: pendingTransaction?._id, error: error.message, stack: error.stack });
      return { success: false, message: 'An error occurred while granting items. Please contact support.' };
    }
  }
}