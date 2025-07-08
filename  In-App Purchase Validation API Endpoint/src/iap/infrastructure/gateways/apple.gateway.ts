import * as appleReceiptVerify from 'apple-receipt-verify';
import { IPlatformIapGateway } from './platform.gateway';

/**
 * @class AppleIapGateway
 * @description Implements the IAP validation logic specifically for Apple App Store receipts.
 * It encapsulates the communication with Apple's validation servers using the 'apple-receipt-verify' library.
 */
export class AppleIapGateway implements IPlatformIapGateway {
  /**
   * Validates an iOS purchase receipt with Apple's servers.
   * @param {string} receiptData - The base64-encoded receipt data from the iOS client.
   * @returns {Promise<{ isValid: boolean; transactionId: string | null; sku: string | null; rawResponse: any; }>}
   *          A standardized validation result.
   */
  public async validate(receiptData: string): Promise<{
    isValid: boolean;
    transactionId: string | null;
    sku: string | null;
    rawResponse: any;
  }> {
    try {
      // Initialize with the shared secret from environment variables
      appleReceiptVerify.config({
        secret: process.env.APPLE_IAP_SHARED_SECRET!,
        environment: ['production'] // You can also add 'sandbox'
      });

      // The library's `validate` function throws on failure.
      const validationResponse = await appleReceiptVerify.validate({
        receipt: receiptData,
        // Excluding old transactions can speed up validation for receipts with many purchases.
        excludeOldTransactions: true, 
      });

      // According to Apple's documentation, status 0 is success.
      if (appleReceiptVerify.isSuccess(validationResponse.status)) {
        // The response is an array of purchase objects. We need the latest one.
        // The library already sorts them by purchase date.
        const latestPurchase = validationResponse.latest_receipt_info[0];

        return {
          isValid: true,
          transactionId: latestPurchase.transaction_id,
          sku: latestPurchase.product_id,
          rawResponse: validationResponse,
        };
      } else {
        // Handle other statuses which indicate an invalid receipt (e.g., 21007 for sandbox receipt sent to prod).
        return {
          isValid: false,
          transactionId: null,
          sku: null,
          rawResponse: validationResponse,
        };
      }
    } catch (error: any) {
      console.error('Apple IAP validation error:', error);
      // The error could be a communication error or an invalid receipt format.
      return {
        isValid: false,
        transactionId: null,
        sku: null,
        rawResponse: { message: error.message, name: error.name },
      };
    }
  }
}