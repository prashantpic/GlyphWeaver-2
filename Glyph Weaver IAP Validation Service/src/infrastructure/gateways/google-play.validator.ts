import { google, androidpublisher_v3 } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import { IPlatformValidatorGateway, ValidationResult } from '../../application/interfaces/platform-validator.gateway.interface';
import { config } from '../../config';

// As per Google Play Developer API documentation
const PURCHASE_STATE_PURCHASED = 0;
const CONSUMPTION_STATE_NOT_CONSUMED = 0;

/**
 * @class GooglePlayValidator
 * @description Implements the IPlatformValidatorGateway for the Google Play Store.
 * This service uses the Google Play Developer API to validate Android purchases
 * via a service account.
 */
export class GooglePlayValidator implements IPlatformValidatorGateway {
    private auth: GoogleAuth;
    private androidPublisher: androidpublisher_v3.Androidpublisher;

    constructor() {
        this.auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: config.google.clientEmail,
                private_key: config.google.privateKey,
            },
            scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });

        this.androidPublisher = google.androidpublisher({
            version: 'v3',
            auth: this.auth,
        });
    }

    /**
     * Validates an Android purchase token with Google's servers.
     * @param receiptData The purchase token from the client.
     * @param sku The product ID (SKU) the client claims to have purchased.
     * @returns A standardized ValidationResult.
     */
    async validateReceipt(receiptData: string, sku: string): Promise<ValidationResult> {
        try {
            const response = await this.androidPublisher.purchases.products.get({
                packageName: config.google.packageName,
                productId: sku,
                token: receiptData,
            });

            const purchase = response.data;

            // Perform critical checks on the purchase state
            if (purchase.purchaseState !== PURCHASE_STATE_PURCHASED) {
                return this.createInvalidResult(purchase, 'Purchase not in "purchased" state.');
            }
            if (purchase.consumptionState !== CONSUMPTION_STATE_NOT_CONSUMED) {
                return this.createInvalidResult(purchase, 'Purchase already consumed.');
            }

            // The orderId is the unique identifier for the transaction
            if (!purchase.orderId) {
                return this.createInvalidResult(purchase, 'Order ID is missing from validation response.');
            }

            return {
                isValid: true,
                transactionId: purchase.orderId,
                purchaseDate: new Date(parseInt(purchase.purchaseTimeMillis!, 10)),
                sku: sku,
                rawResponse: purchase,
            };
        } catch (error: any) {
            console.error('Error validating Google Play receipt:', error.response?.data || error.message);
            return this.createInvalidResult(error.response?.data || { error: error.message });
        }
    }

    private createInvalidResult(rawResponse: any, reason?: string): ValidationResult {
        return {
            isValid: false,
            transactionId: null,
            purchaseDate: null,
            sku: null,
            rawResponse: { ...rawResponse, validation_error: reason },
        };
    }
}