import axios, { AxiosInstance, AxiosError } from 'axios';
import { GoogleAuth } from 'google-auth-library';
import { iapConfig } from '../../config/iap.config';
import { IPlatformReceiptClient, GooglePurchaseProductResponse, GooglePurchaseSubscriptionResponse } from './../interfaces/iap.interfaces';
import { logger } from '../../common/utils/logger.util'; // Assuming a logger utility

// Union type for Google validation responses
export type GoogleValidationResponse = GooglePurchaseProductResponse | GooglePurchaseSubscriptionResponse;

export class GoogleReceiptClient implements IPlatformReceiptClient<GoogleValidationResponse> {
    private httpClient: AxiosInstance;
    private authClient: GoogleAuth;
    private validationBaseUrl: string;

    constructor() {
        this.httpClient = axios.create({
            timeout: iapConfig.google.timeoutMs || 10000,
        });
        
        if (!iapConfig.google.serviceAccountKeyPath && !iapConfig.google.serviceAccountJson) {
            const msg = 'Google IAP: Service account key path or JSON must be configured.';
            logger.error(msg);
            throw new Error(msg);
        }

        const authOptions: any = {
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        };

        if (iapConfig.google.serviceAccountJson) {
            try {
                authOptions.credentials = JSON.parse(iapConfig.google.serviceAccountJson);
            } catch (e: any) {
                const msg = `Google IAP: Failed to parse serviceAccountJson: ${e.message}`;
                logger.error(msg);
                throw new Error(msg);
            }
        } else if (iapConfig.google.serviceAccountKeyPath) {
             authOptions.keyFilename = iapConfig.google.serviceAccountKeyPath;
        }


        this.authClient = new GoogleAuth(authOptions);
        
        this.validationBaseUrl = iapConfig.google.validationUrl; // e.g., "https://androidpublisher.googleapis.com/androidpublisher/v3/applications"
        if (!this.validationBaseUrl) {
            throw new Error('Google IAP validation base URL is not configured.');
        }
    }

    private async getAccessToken(): Promise<string> {
        const client = await this.authClient.getClient();
        const tokenResponse = await client.getAccessToken();
        if (!tokenResponse.token) {
            throw new Error('Failed to retrieve Google API access token.');
        }
        return tokenResponse.token;
    }

    // For one-time products
    async validateProduct(packageName: string, productId: string, purchaseToken: string): Promise<GooglePurchaseProductResponse> {
        const accessToken = await this.getAccessToken();
        const url = `${this.validationBaseUrl}/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;

        try {
            logger.debug(`Sending Google product purchase validation request to: ${url}`);
            const response = await this.httpClient.get<GooglePurchaseProductResponse>(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            logger.debug(`Google product purchase validation response status: ${response.status}, data: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            this.handleGoogleApiError(error, 'product purchase');
            throw error; // Should be caught by handleGoogleApiError or rethrow if not an AxiosError
        }
    }

    // For subscriptions
    async validateSubscription(packageName: string, subscriptionId: string, purchaseToken: string): Promise<GooglePurchaseSubscriptionResponse> {
        const accessToken = await this.getAccessToken();
        const url = `${this.validationBaseUrl}/${packageName}/purchases/subscriptions/${subscriptionId}/tokens/${purchaseToken}`;
        
        try {
            logger.debug(`Sending Google subscription purchase validation request to: ${url}`);
            const response = await this.httpClient.get<GooglePurchaseSubscriptionResponse>(url, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            logger.debug(`Google subscription purchase validation response status: ${response.status}, data: ${JSON.stringify(response.data)}`);
            return response.data;
        } catch (error) {
            this.handleGoogleApiError(error, 'subscription purchase');
            throw error; 
        }
    }
    
    private handleGoogleApiError(error: any, type: string): void {
        const axiosError = error as AxiosError;
        logger.error(`Error validating Google ${type}:`, axiosError.message);
        if (axiosError.response) {
            logger.error(`Google ${type} validation error response status: ${axiosError.response.status}, data:`, axiosError.response.data);
             // Rethrow a structured error
            throw {
                isAxiosError: true,
                message: (axiosError.response.data as any)?.error?.message || axiosError.message,
                status: axiosError.response.status,
                data: axiosError.response.data,
            };
        }
        // Rethrow if not an Axios error or no response
        throw error;
    }


    // Generic validate method for IPlatformReceiptClient - requires more args for Google
    // This client differentiates between product and subscription, so a simple 'validate' might be ambiguous
    // or require a type parameter. For now, use specific methods.
    async validate(purchaseToken: string, productId: string, packageName: string, type: 'product' | 'subscription' = 'product'): Promise<GoogleValidationResponse> {
        if (type === 'subscription') {
            return this.validateSubscription(packageName, productId, purchaseToken); // productId is subscriptionId here
        }
        return this.validateProduct(packageName, productId, purchaseToken);
    }
}