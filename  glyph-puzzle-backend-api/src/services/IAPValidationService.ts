import { IIAPValidationService } from './interfaces/IIAPValidationService';
import { IIAPTransactionRepository } from './interfaces/IIAPTransactionRepository';
import { IInventoryRepository } from './interfaces/IInventoryRepository';
import { ICurrencyRepository } from './interfaces/ICurrencyRepository';
import { IExternalApiService } from './interfaces/IExternalApiService';
import { IAuditLogRepository } from './interfaces/IAuditLogRepository';
import { IInAppPurchaseRepository } from './interfaces/IInAppPurchaseRepository'; // To get item details
// Assuming DTOs are in src/api/iap/dtos
import { ValidateReceiptRequestDTO, ValidationResponseDTO } from '../api/iap/dtos';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';
import { environmentConfig } from '../config';

// REQ-8-013, REQ-SEC-008, REQ-SEC-019, REQ-8-019, REQ-8-016
interface AppleReceiptValidationResponse {
    status: number;
    receipt?: {
        in_app: Array<{
            product_id: string;
            transaction_id: string;
            original_transaction_id: string;
            purchase_date_ms: string;
            quantity: string;
        }>;
        bundle_id?: string;
    };
    environment?: string;
    'latest_receipt_info'?: any[]; // For subscriptions or if receipt is old
    'pending_renewal_info'?: any[];
}

interface GoogleReceiptValidationResponse {
    purchaseState?: number; // 0: purchased, 1: canceled, 2: pending
    consumptionState?: number; // 0: not consumed, 1: consumed
    developerPayload?: string;
    kind?: string;
    orderId?: string;
    productId?: string;
    purchaseTimeMillis?: string;
    purchaseToken?: string;
}


export class IAPValidationService implements IIAPValidationService {
    constructor(
        private iapTransactionRepository: IIAPTransactionRepository,
        private inventoryRepository: IInventoryRepository,
        private currencyRepository: ICurrencyRepository,
        private externalApiService: IExternalApiService,
        private auditLogRepository: IAuditLogRepository,
        private iapCatalogRepository: IInAppPurchaseRepository, // To look up SKU details
    ) {}

    async validateReceipt(playerId: string, request: ValidateReceiptRequestDTO): Promise<ValidationResponseDTO> {
        const { platform, receiptData, productId, transactionId: clientTransactionId } = request;
        logger.info(`Validating IAP receipt for player ${playerId}, platform ${platform}, product ${productId}`);

        // Log initial attempt
        const pendingTransaction = await this.iapTransactionRepository.create({
            playerId,
            platform,
            productId,
            receiptData, // Potentially large, consider only storing a hash or subset if needed
            clientTransactionId,
            status: 'pending',
            validationAttempts: 1,
        });

        try {
            let isValid = false;
            let serverTransactionId: string | undefined = clientTransactionId;
            let purchasedProductId: string = productId;
            let quantity = 1; // Default quantity

            if (platform === 'apple') {
                const appleResponse = await this.validateAppleReceipt(receiptData, productId);
                isValid = appleResponse.isValid;
                serverTransactionId = appleResponse.transactionId;
                purchasedProductId = appleResponse.productId || productId; // Use product ID from receipt if available
                quantity = appleResponse.quantity || 1;

            } else if (platform === 'google') {
                // For Google, receiptData is typically the purchaseToken
                const googleResponse = await this.validateGoogleReceipt(productId, receiptData);
                isValid = googleResponse.isValid;
                serverTransactionId = googleResponse.orderId; // Google's orderId can serve as a transactionId
                purchasedProductId = googleResponse.productId || productId;
            } else {
                throw new ApiError('Unsupported IAP platform.', 400);
            }

            if (!serverTransactionId) {
                logger.warn(`Validation for player ${playerId}, product ${productId} did not yield a server transaction ID.`);
                // Depending on policy, might still proceed if isValid is true from platform but no distinct TxID.
                // For now, treat as an issue if a TxID is expected for de-duplication.
                if (platform === 'apple') serverTransactionId = `apple_unknown_${Date.now()}`; // Fallback if truly missing
                else if (platform === 'google') serverTransactionId = `google_unknown_${Date.now()}`;
            }

            if (isValid && serverTransactionId) {
                const isDuplicate = await this.iapTransactionRepository.isTransactionProcessed(serverTransactionId, platform);
                if (isDuplicate) {
                    logger.warn(`Duplicate transaction detected: ${serverTransactionId} for player ${playerId}`);
                    await this.iapTransactionRepository.updateStatus(pendingTransaction.id, 'duplicate', { serverTransactionId });
                    // Return success=true but indicate it's a duplicate, no items granted again
                    return { success: true, message: 'Transaction already processed.', transactionDetails: { transactionId: serverTransactionId } };
                }

                // Grant items/currency
                const grantResult = await this.grantPurchasedContent(playerId, purchasedProductId, quantity);

                await this.iapTransactionRepository.updateStatus(pendingTransaction.id, 'completed', {
                    serverTransactionId,
                    grantedItems: grantResult.grantedItems,
                    grantedCurrency: grantResult.grantedCurrency,
                });

                await this.auditLogRepository.logEvent({
                    eventType: 'IAP_VALIDATION_SUCCESS',
                    userId: playerId,
                    details: { platform, productId, transactionId: serverTransactionId, granted: grantResult },
                });

                logger.info(`IAP receipt validated and items granted for player ${playerId}, product ${productId}, transaction ${serverTransactionId}`);
                return {
                    success: true,
                    grantedItems: grantResult.grantedItems,
                    grantedCurrency: grantResult.grantedCurrency,
                    transactionDetails: { transactionId: serverTransactionId, productId: purchasedProductId },
                };
            } else {
                logger.warn(`IAP receipt validation failed for player ${playerId}, product ${productId}. Reason: Platform validation failed.`);
                await this.iapTransactionRepository.updateStatus(pendingTransaction.id, 'failed', { serverTransactionId, failureReason: 'Platform validation failed' });
                await this.auditLogRepository.logEvent({
                    eventType: 'IAP_VALIDATION_FAILURE',
                    userId: playerId,
                    details: { platform, productId, reason: 'Platform validation failed' },
                });
                return { success: false, errorMessage: 'Receipt validation failed.' };
            }
        } catch (error: any) {
            logger.error(`Error during IAP validation for player ${playerId}: ${error.message}`, { error });
            await this.iapTransactionRepository.updateStatus(pendingTransaction.id, 'error', { failureReason: error.message });
            await this.auditLogRepository.logEvent({
                eventType: 'IAP_VALIDATION_ERROR',
                userId: playerId,
                details: { platform, productId, error: error.message },
            });
            throw new ApiError(error.message || 'IAP validation process failed.', error.statusCode || 500);
        }
    }

    private async validateAppleReceipt(receiptData: string, expectedProductId: string): Promise<{ isValid: boolean; transactionId?: string; productId?: string; quantity?: number }> {
        const validationUrl = environmentConfig.appleIapValidationUrl;
        const password = environmentConfig.appleIapSharedSecret;

        if (!validationUrl || !password) {
            logger.error("Apple IAP validation URL or shared secret not configured.");
            throw new ApiError("Server configuration error for Apple IAP.", 500);
        }

        try {
            const response = await this.externalApiService.post<any, AppleReceiptValidationResponse>(validationUrl, {
                'receipt-data': receiptData,
                'password': password,
                'exclude-old-transactions': true
            });

            if (response.status === 0 && response.receipt && response.receipt.in_app) {
                // Find the transaction for the specific product ID if multiple are in the receipt
                const purchaseInfo = response.receipt.in_app.find(
                    item => item.product_id === expectedProductId || (response.receipt!.in_app.length === 1 && item.product_id) // Fallback if only one item
                );

                if (purchaseInfo) {
                    logger.info(`Apple receipt validated successfully: status ${response.status}, transaction ${purchaseInfo.transaction_id}`);
                    return {
                        isValid: true,
                        transactionId: purchaseInfo.transaction_id,
                        productId: purchaseInfo.product_id,
                        quantity: parseInt(purchaseInfo.quantity) || 1
                    };
                } else {
                     // If status is 0, but receipt is for a different product or empty in_app for this product.
                    // This can happen with auto-renewable subscriptions where original receipt is sent.
                    // Check latest_receipt_info as well if applicable for subscriptions.
                    if (response.latest_receipt_info && response.latest_receipt_info.length > 0) {
                        const latestPurchase = response.latest_receipt_info.find(item => item.product_id === expectedProductId);
                        if (latestPurchase) {
                             logger.info(`Apple receipt validated (via latest_receipt_info): status ${response.status}, transaction ${latestPurchase.transaction_id}`);
                             return {
                                isValid: true,
                                transactionId: latestPurchase.original_transaction_id || latestPurchase.transaction_id, // Prefer original for subscriptions
                                productId: latestPurchase.product_id,
                                quantity: parseInt(latestPurchase.quantity) || 1
                            };
                        }
                    }
                    logger.warn(`Apple receipt validation: status 0, but product ${expectedProductId} not found in in_app items. Bundle ID: ${response.receipt.bundle_id}`);
                    return { isValid: false, transactionId: response.receipt.in_app[0]?.transaction_id }; // Return a txId if available for logging
                }
            } else {
                logger.warn(`Apple receipt validation failed: status ${response.status}`);
                return { isValid: false };
            }
        } catch (error: any) {
            logger.error('Error calling Apple validation API:', error.message);
            // Check for specific sandbox/production redirect status for Apple (21007, 21008)
            if (error.data && error.data.status === 21007 && validationUrl === environmentConfig.appleIapValidationUrl) {
                logger.info('Apple status 21007 received, trying sandbox URL.');
                environmentConfig.appleIapValidationUrl = environmentConfig.appleIapSandboxValidationUrl; // Temporarily switch for retry
                const result = await this.validateAppleReceipt(receiptData, expectedProductId);
                environmentConfig.appleIapValidationUrl = validationUrl; // Switch back
                return result;
            }
            return { isValid: false };
        }
    }

    private async validateGoogleReceipt(productId: string, purchaseToken: string): Promise<{ isValid: boolean; orderId?: string; productId?: string; }> {
        // For Google, the `receiptData` is the `purchaseToken`.
        // `productId` is the SKU.
        // The actual validation involves using the Google Play Developer API (e.g., purchases.products.get or purchases.subscriptions.get)
        const packageName = environmentConfig.googleIapPackageName;
        if (!packageName) {
             logger.error("Google IAP package name not configured.");
             throw new ApiError("Server configuration error for Google IAP.", 500);
        }
        // This requires OAuth2 token for Google API, typically managed by a Google API client library.
        // For this example, we'll conceptualize the call.
        // const googleApiUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;
        // Or for subscriptions:
        // const googleApiUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`;

        // For this simplified example, we'll assume externalApiService can handle auth if Google API client library is wrapped.
        // A real implementation would use `google-auth-library` and `googleapis`.
        logger.info(`Attempting to validate Google Play purchase: SKU ${productId}, Token ${purchaseToken.substring(0,20)}...`);

        // This is a MOCK of what the Google API client would do.
        // In a real scenario, you'd use the `googleapis` library.
        try {
            // Example: const playApi = google.androidpublisher('v3');
            // const response = await playApi.purchases.products.get({ packageName, productId, token: purchaseToken, auth: oauth2Client });
            // For this SDS, we use IExternalApiService as a generic wrapper.
            // The actual URL and auth mechanism needs to be set up for IExternalApiService to work with Google APIs.
            // For now, let's simulate a successful response structure if using a direct, authenticated GET request for a product
            // (Note: this is not how the Google API is typically used without the client library for auth).

            const validationResponse: GoogleReceiptValidationResponse = await this.externalApiService.get(
                `${environmentConfig.googleIapValidationUrl}/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`
                // Config would include OAuth token, e.g., headers: { Authorization: `Bearer ${accessToken}` }
            );

            if (validationResponse && validationResponse.purchaseState === 0) { // 0 is Purchased
                logger.info(`Google purchase validated: OrderID ${validationResponse.orderId}, ProductID ${validationResponse.productId}`);
                return {
                    isValid: true,
                    orderId: validationResponse.orderId,
                    productId: validationResponse.productId,
                };
            } else {
                logger.warn(`Google purchase validation failed or not in purchased state: ${JSON.stringify(validationResponse)}`);
                return { isValid: false, orderId: validationResponse?.orderId };
            }
        } catch (error: any) {
            logger.error(`Error validating Google purchase: ${error.message}`, error.data);
            return { isValid: false };
        }
    }

    private async grantPurchasedContent(playerId: string, sku: string, quantity: number): Promise<{ grantedItems: Array<{ itemId: string, quantity: number }>, grantedCurrency: Array<{ currencyId: string, amount: number }> }> {
        const productDetails = await this.iapCatalogRepository.findBySku(sku);
        if (!productDetails || !productDetails.isActive) {
            throw new ApiError(`Product SKU ${sku} not found or inactive.`, 404);
        }

        const grantedItems: Array<{ itemId: string, quantity: number }> = [];
        const grantedCurrency: Array<{ currencyId: string, amount: number }> = [];

        // Example: productDetails might have { type: 'currency', currencyId: 'gems', amount: 100 }
        // or { type: 'item_pack', items: [{ itemId: 'hint', quantity: 5 }] }
        switch (productDetails.type) {
            case 'currency':
                if (productDetails.content?.currencyId && productDetails.content?.amount) {
                    await this.currencyRepository.credit(playerId, productDetails.content.currencyId, productDetails.content.amount * quantity);
                    grantedCurrency.push({ currencyId: productDetails.content.currencyId, amount: productDetails.content.amount * quantity });
                }
                break;
            case 'hint_pack': // Assuming 'hint_pack' means granting 'hint' items
            case 'undo_pack': // Assuming 'undo_pack' means granting 'undo' items
            case 'cosmetic': // Could be an item or an unlock flag
                if (productDetails.content?.items && Array.isArray(productDetails.content.items)) {
                    for (const item of productDetails.content.items) {
                        await this.inventoryRepository.addItem(playerId, item.itemId, item.quantity * quantity);
                        grantedItems.push({ itemId: item.itemId, quantity: item.quantity * quantity });
                    }
                } else if (productDetails.content?.itemId && productDetails.content?.itemQuantity) { // Simpler single item structure
                     await this.inventoryRepository.addItem(playerId, productDetails.content.itemId, productDetails.content.itemQuantity * quantity);
                     grantedItems.push({ itemId: productDetails.content.itemId, quantity: productDetails.content.itemQuantity * quantity });
                }
                break;
            default:
                logger.warn(`Unknown IAP product type ${productDetails.type} for SKU ${sku}. No items granted.`);
                throw new ApiError(`Cannot process IAP type: ${productDetails.type}`, 500);
        }
        return { grantedItems, grantedCurrency };
    }
}