import axios, { AxiosInstance, AxiosError } from 'axios';
import { iapConfig } from '../../config/iap.config';
import { IPlatformReceiptClient, AppleReceiptValidationResponse, AppleReceiptInfo, AppleLatestReceiptInfo, ApplePendingRenewalInfo } from './../interfaces/iap.interfaces';
import { logger } from '../../common/utils/logger.util'; // Assuming a logger utility

// More detailed Apple interfaces (can be expanded based on Apple's full response)
interface AppleInAppPurchase {
    quantity: string;
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date: string;
    purchase_date_ms: string;
    purchase_date_pst: string;
    original_purchase_date: string;
    original_purchase_date_ms: string;
    original_purchase_date_pst: string;
    is_trial_period: string; // "true" or "false"
    // ... and other fields
}

interface ExtendedAppleReceiptInfo extends AppleReceiptInfo {
    in_app: AppleInAppPurchase[];
    // ... other fields like application_version, original_application_version
}

interface ExtendedAppleLatestReceiptInfo extends AppleLatestReceiptInfo, AppleInAppPurchase {
    // Combines purchase info with latest receipt info markers
    expires_date?: string;
    expires_date_ms?: string;
    expires_date_pst?: string;
    web_order_line_item_id?: string;
    // ... and other subscription related fields
}

export interface ExtendedAppleReceiptValidationResponse extends AppleReceiptValidationResponse {
    receipt?: ExtendedAppleReceiptInfo;
    latest_receipt_info?: ExtendedAppleLatestReceiptInfo[];
    // pending_renewal_info is an array of objects with subscription details
}


export class AppleReceiptClient implements IPlatformReceiptClient<ExtendedAppleReceiptValidationResponse> {
    private httpClient: AxiosInstance;
    private productionUrl: string;
    private sandboxUrl: string;
    private sharedSecret?: string;

    constructor() {
        this.httpClient = axios.create({
            timeout: iapConfig.apple.timeoutMs || 10000, // Default timeout 10s
        });
        this.productionUrl = iapConfig.apple.validationUrl;
        this.sandboxUrl = iapConfig.apple.sandboxValidationUrl;
        this.sharedSecret = iapConfig.apple.sharedSecret;

        if (!this.productionUrl || !this.sandboxUrl) {
            throw new Error('Apple IAP validation URLs are not configured.');
        }
    }

    private async sendValidationRequest(url: string, receiptData: string): Promise<ExtendedAppleReceiptValidationResponse> {
        const payload: { 'receipt-data': string; password?: string; 'exclude-old-transactions'?: boolean } = {
            'receipt-data': receiptData,
        };

        if (this.sharedSecret) {
            payload.password = this.sharedSecret;
        }
        
        // Recommended by Apple for subscriptions to get only the latest transaction for each subscription.
        payload['exclude-old-transactions'] = true; 

        try {
            logger.debug(`Sending Apple receipt validation request to: ${url}`);
            const response = await this.httpClient.post<ExtendedAppleReceiptValidationResponse>(url, payload);
            logger.debug(`Apple receipt validation response status: ${response.status}, data: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            const axiosError = error as AxiosError;
            logger.error('Error validating Apple receipt:', axiosError.message);
            if (axiosError.response) {
                logger.error('Apple validation error response data:', axiosError.response.data);
                // Rethrow a structured error or the response data itself if it contains error info
                throw {
                    isAxiosError: true,
                    message: axiosError.message,
                    status: axiosError.response.status,
                    data: axiosError.response.data,
                };
            }
            throw error; // Rethrow other errors
        }
    }

    async validate(receiptData: string, isSandboxAttempt: boolean = false): Promise<ExtendedAppleReceiptValidationResponse> {
        let validationUrl = isSandboxAttempt ? this.sandboxUrl : this.productionUrl;
        let response = await this.sendValidationRequest(validationUrl, receiptData);

        // Apple's recommended flow: if status 21007, retry with sandbox URL.
        // https://developer.apple.com/library/archive/releasenotes/General/ValidateAppStoreReceipt/Chapters/ValidateRemotely.html
        if (response.status === 21007 && !isSandboxAttempt) {
            logger.info('Apple receipt status 21007, trying sandbox environment.');
            validationUrl = this.sandboxUrl;
            response = await this.sendValidationRequest(validationUrl, receiptData);
            // Add environment to response to indicate which one it was validated against
            if (response.status === 0) {
                 response.environment = 'Sandbox'; // Explicitly mark if successful from sandbox after 21007
            }
        } else if (response.status === 0 && !isSandboxAttempt) {
            response.environment = 'Production';
        } else if (response.status === 0 && isSandboxAttempt) {
            response.environment = 'Sandbox';
        }
        
        return response;
    }
}