/**
 * @interface ValidationResult
 * @description Defines the standardized structure for the result of a receipt validation.
 * This ensures that the application layer receives a consistent response regardless of
 * the underlying platform (Apple or Google).
 */
export interface ValidationResult {
    /**
     * Indicates whether the receipt is valid.
     */
    isValid: boolean;
    /**
     * The unique transaction identifier from the platform (e.g., Apple's `transaction_id` or Google's `orderId`).
     * This is null if validation fails.
     */
    transactionId: string | null;
    /**
     * The date and time of the purchase. Null if validation fails.
     */
    purchaseDate: Date | null;
    /**
     * The Stock Keeping Unit (SKU) or Product ID of the purchased item. Null if validation fails.
     */
    sku: string | null;
    /**
     * The original, raw response from the platform's validation server.
     * Useful for debugging and storing for auditing purposes.
     */
    rawResponse: any;
}

/**
 * @interface IPlatformValidatorGateway
 * @description Defines the port for a platform-specific IAP validator gateway.
 * This abstraction allows the application service to be completely agnostic of the
 * specific details of communicating with Apple's or Google's validation servers.
 */
export interface IPlatformValidatorGateway {
    /**
     * Validates a purchase receipt with the corresponding platform service.
     * @param receiptData The platform-specific receipt data or token from the client.
     * @param sku The product SKU the client claims to have purchased. Used for an extra layer of verification.
     * @returns A Promise that resolves to a standardized `ValidationResult`.
     */
    validateReceipt(receiptData: string, sku: string): Promise<ValidationResult>;
}