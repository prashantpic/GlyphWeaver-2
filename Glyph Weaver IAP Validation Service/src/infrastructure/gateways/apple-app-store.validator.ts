import { AxiosInstance } from 'axios';
import { IPlatformValidatorGateway, ValidationResult } from '../../application/interfaces/platform-validator.gateway.interface';
import { config } from '../../config';

// As per Apple's documentation for status codes
const STATUS_OK = 0;
const STATUS_SANDBOX_RECEIPT = 21007;

/**
 * @class AppleAppStoreValidator
 * @description Implements the IPlatformValidatorGateway for Apple's App Store.
 * This service communicates with Apple's `verifyReceipt` endpoint to validate
 * iOS purchase receipts. It handles production and sandbox environments.
 */
export class AppleAppStoreValidator implements IPlatformValidatorGateway {
    constructor(private readonly httpClient: AxiosInstance) {}

    /**
     * Validates an iOS receipt with Apple's servers.
     * It first tries the production URL, and if it receives a sandbox status code,
     * it automatically retries with the sandbox URL.
     * @param receiptData The base64-encoded receipt data from the client.
     * @param sku The product SKU the client claims to have purchased.
     * @returns A standardized ValidationResult.
     */
    async validateReceipt(receiptData: string, sku: string): Promise<ValidationResult> {
        let result = await this.verify(receiptData, config.apple.validationUrl);

        // If the receipt is for the sandbox environment, retry with the sandbox URL
        if (result.status === STATUS_SANDBOX_RECEIPT) {
            result = await this.verify(receiptData, config.apple.sandboxValidationUrl);
        }

        if (result.status !== STATUS_OK) {
            return {
                isValid: false,
                transactionId: null,
                purchaseDate: null,
                sku: null,
                rawResponse: result,
            };
        }

        // The response can contain multiple transactions. We need to find the one
        // that matches the SKU we are trying to validate. Apple returns the latest
        // transactions first, so we search in reverse to find the earliest match.
        const transactions = result.latest_receipt_info || result.receipt?.in_app || [];
        const relevantTransaction = [...transactions].reverse().find(
            (t: any) => t.product_id === sku
        );

        if (!relevantTransaction) {
            return {
                isValid: false,
                transactionId: null,
                purchaseDate: null,
                sku: null,
                rawResponse: { ...result, error: 'SKU not found in receipt' },
            };
        }

        return {
            isValid: true,
            transactionId: relevantTransaction.transaction_id,
            purchaseDate: new Date(parseInt(relevantTransaction.purchase_date_ms, 10)),
            sku: relevantTransaction.product_id,
            rawResponse: result,
        };
    }

    /**
     * Performs the actual HTTP POST request to an Apple validation URL.
     * @param receiptData The base64-encoded receipt.
     * @param url The validation URL (production or sandbox).
     * @returns The JSON response body from Apple.
     */
    private async verify(receiptData: string, url: string): Promise<any> {
        const payload = {
            'receipt-data': receiptData,
            'password': config.apple.sharedSecret,
            'exclude-old-transactions': true,
        };

        try {
            const response = await this.httpClient.post(url, payload);
            return response.data;
        } catch (error: any) {
            // Log the error properly in a real application
            console.error('Error validating Apple receipt:', error.response?.data || error.message);
            return { status: -1, error: 'HTTP request failed' };
        }
    }
}