import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../../config';
import {
  IAPReceiptData,
  IAPValidationResult,
  VerifyIapReceiptActivityInput,
} from '../../interfaces/iap.interfaces';
import { ServiceUnavailableError, IAPValidationFailedError } from '../../error_handling/custom_errors';

export class IapValidationPlatformClient {
  private httpClient: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = config.services.iapValidation.apiKey;
    this.httpClient = axios.create({
      baseURL: config.services.iapValidation.endpoint,
      headers: {
        'Content-Type': 'application/json',
        // Assuming API key is sent via a custom header, e.g., 'X-API-Key'
        // Adjust if authentication is different (e.g., Bearer token)
        'X-API-Key': this.apiKey,
      },
      timeout: 15000, // 15 seconds timeout
    });
  }

  public async verifyReceipt(
    input: VerifyIapReceiptActivityInput, // Using the activity input directly for now
  ): Promise<IAPValidationResult> {
    try {
      // The external service might expect a slightly different payload than VerifyIapReceiptActivityInput
      // Map VerifyIapReceiptActivityInput to the service's expected payload if necessary
      const requestPayload: IAPReceiptData = { // Assuming IAPReceiptData is what the external service expects
        receipt: input.receiptData,
        productId: input.productId,
        transactionId: input.transactionId,
        platform: input.platform,
      };

      const response = await this.httpClient.post<IAPValidationResult>('/verify', requestPayload); // Endpoint path might vary
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        if (axiosError.response) {
          // API responded with an error status (4xx, 5xx)
          // Map to a specific ApplicationFailure
          throw IAPValidationFailedError(
            `IAP validation service error: ${axiosError.response.status} ${axiosError.response.data?.message || axiosError.message}`,
            axiosError.response.data?.details,
          );
        } else if (axiosError.request) {
          // Request was made but no response received (e.g., network error, timeout)
          throw ServiceUnavailableError('IAPValidationPlatformService (no response)', axiosError);
        }
      }
      // Fallback for non-Axios errors or unexpected issues
      throw ServiceUnavailableError('IAPValidationPlatformService (unknown error)', error instanceof Error ? error : new Error(String(error)));
    }
  }
}

// Export a singleton instance
export const iapValidationPlatformClient = new IapValidationPlatformClient();