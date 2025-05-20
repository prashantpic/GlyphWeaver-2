import { ValidateReceiptDto } from "../dto/validate-receipt.dto";
import { ValidationResultDto } from "../dto/validation-result.dto";

export interface IIapService {
    validateAppleReceipt(receiptData: string, isSandbox?: boolean): Promise<ValidationResultDto>;
    validateGoogleReceipt(purchaseToken: string, productId: string, packageName: string, type?: 'product' | 'subscription'): Promise<ValidationResultDto>;
    // A generic validation method could also be defined
    validateReceipt(dto: ValidateReceiptDto): Promise<ValidationResultDto>;
}

// Generic platform client interface
export interface IPlatformReceiptClient<TResponse = any> {
    validate(...args: any[]): Promise<TResponse>;
}


// --- Apple Raw Response Structures (Simplified - can be much more detailed) ---
export interface AppleInAppItem {
    quantity: string;
    product_id: string;
    transaction_id: string;
    original_transaction_id: string;
    purchase_date: string; // "2023-07-20 10:00:00 Etc/GMT"
    purchase_date_ms: string; // "1689847200000"
    purchase_date_pst: string; // "2023-07-20 03:00:00 America/Los_Angeles"
    original_purchase_date: string;
    original_purchase_date_ms: string;
    original_purchase_date_pst: string;
    is_trial_period: 'true' | 'false';
    // For subscriptions
    expires_date?: string;
    expires_date_ms?: string;
    expires_date_pst?: string;
    web_order_line_item_id?: string;
    is_in_intro_offer_period?: 'true' | 'false';
    // ... and many other fields
}

export interface AppleReceiptInfo {
    bundle_id: string;
    application_version: string;
    original_application_version: string;
    receipt_creation_date: string;
    receipt_creation_date_ms: string;
    receipt_creation_date_pst: string;
    request_date: string;
    request_date_ms: string;
    request_date_pst: string;
    original_purchase_date: string;
    original_purchase_date_ms: string;
    original_purchase_date_pst: string;
    receipt_type: string; // "ProductionSandbox", "Production"
    in_app: AppleInAppItem[];
    // ... and other fields
}

export interface AppleLatestReceiptInfo extends AppleInAppItem {
    // Contains fields from AppleInAppItem plus subscription specific details
    // This structure is for items in the latest_receipt_info array
}

export interface ApplePendingRenewalInfo {
    auto_renew_product_id: string;
    original_transaction_id: string;
    product_id: string;
    auto_renew_status: '0' | '1'; // 0 = off, 1 = on
    is_in_billing_retry_period?: '0' | '1';
    // ... and other fields
}

export interface AppleReceiptValidationResponse {
    status: number; // 0 for valid, other codes for errors (e.g., 21007 for sandbox receipt sent to prod)
    environment?: 'Sandbox' | 'Production';
    receipt?: AppleReceiptInfo;
    latest_receipt_info?: AppleLatestReceiptInfo[];
    pending_renewal_info?: ApplePendingRenewalInfo[];
    is_retryable?: boolean; // If true, Apple suggests retrying later
    // For unified handling, you might add a generic error message property
    error_message?: string; 
}


// --- Google Raw Response Structures (Simplified) ---
// For Product Purchases (One-time)
export interface GooglePurchaseProductResponse {
    purchaseTimeMillis?: string; // Purchase time in milliseconds since Epoch
    purchaseState?: number; // 0: Purchased, 1: Canceled, 2: Pending
    consumptionState?: number; // 0: Yet to be consumed, 1: Consumed
    developerPayload?: string;
    orderId?: string; // Unique order identifier
    purchaseType?: number; // 0: Test, 1: Promo, 2: Rewarded (if applicable)
    acknowledgementState?: number; // 0: Yet to be acknowledged, 1: Acknowledged
    kind?: 'androidpublisher#productPurchase';
    regionCode?: string;
    // For errors
    error?: GoogleApiError;
}

// For Subscription Purchases
export interface GooglePurchaseSubscriptionResponse {
    startTimeMillis?: string; // Subscription start time
    expiryTimeMillis?: string; // Subscription expiry time
    autoRenewing?: boolean;
    priceCurrencyCode?: string;
    priceAmountMicros?: string;
    countryCode?: string;
    developerPayload?: string;
    paymentState?: number; // 0: Payment pending, 1: Payment received, 2: Free trial, 3: Pending deferred upgrade/downgrade
    orderId?: string;
    purchaseType?: number; // 0: Test (i.e. purchased from a license testing account)
    acknowledgementState?: number; // 0: Yet to be acknowledged, 1: Acknowledged
    kind?: 'androidpublisher#subscriptionPurchase';
    // For linked purchases (upgrades, downgrades)
    linkedPurchaseToken?: string; 
    // For subscriptions offered with introductory price or free trial.
    introductoryPriceInfo?: any;
    // ... and other fields
    // For errors
    error?: GoogleApiError;
}

export interface GoogleApiError {
    code: number;
    message: string;
    errors?: Array<{
        message: string;
        domain: string;
        reason: string;
    }>;
}