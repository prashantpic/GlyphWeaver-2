import { GooglePlay, Purchase } from 'google-play-billing';
import { IPlatformIapGateway } from './platform.gateway';

/**
 * @class GoogleIapGateway
 * @description Implements the IAP validation logic specifically for Google Play Store receipts.
 * It encapsulates communication with the Google Play Developer API using the 'google-play-billing' library.
 */
export class GoogleIapGateway implements IPlatformIapGateway {
  private readonly googlePlay: GooglePlay;

  constructor() {
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_BASE64 || !process.env.GOOGLE_PACKAGE_NAME) {
      throw new Error('Google IAP environment variables are not configured.');
    }
    
    const serviceAccountJson = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Initialize the Google Play client
    this.googlePlay = new GooglePlay({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
    });
  }

  /**
   * Validates an Android purchase receipt with Google's servers.
   * @param {{ token: string; sku: string }} receiptData - An object containing the purchase token and the product SKU.
   * @returns {Promise<{ isValid: boolean; transactionId: string | null; sku: string | null; rawResponse: any; }>}
   *          A standardized validation result.
   */
  public async validate(receiptData: { token: string; sku: string }): Promise<{
    isValid: boolean;
    transactionId: string | null;
    sku: string | null;
    rawResponse: any;
  }> {
    try {
      // Verify the purchase with the Google Play Developer API
      const response = await this.googlePlay.verifyPurchase(
        process.env.GOOGLE_PACKAGE_NAME!,
        receiptData.sku,
        receiptData.token
      );

      // According to Google's documentation, purchaseState 0 means 'Purchased'.
      // 1 is 'Canceled', 2 is 'Pending'. We only accept 0.
      if (response && response.purchaseState === 0) {
        return {
          isValid: true,
          transactionId: response.orderId, // orderId is the unique identifier for the transaction
          sku: receiptData.sku,
          rawResponse: response,
        };
      } else {
        // This covers cases where the purchase was cancelled, is pending, or the response is otherwise invalid.
        return {
          isValid: false,
          transactionId: null,
          sku: null,
          rawResponse: response,
        };
      }
    } catch (error: any) {
      console.error('Google IAP validation error:', error);
      // This can happen for various reasons, like an invalid token or API communication issues.
      return {
        isValid: false,
        transactionId: null,
        sku: null,
        rawResponse: { message: error.message, name: error.name },
      };
    }
  }
}