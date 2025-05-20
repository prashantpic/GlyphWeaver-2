export enum IapPlatform {
  APPLE = 'apple',
  GOOGLE = 'google',
}

export enum IapValidationStatus {
  VALID = 'valid',
  INVALID = 'invalid',
  PENDING = 'pending', // For cases like deferred purchases or server-side retries
  ERROR = 'error', // For internal errors during validation
}

export class IapTransaction {
  transactionId: string; // Platform-specific transaction ID
  originalTransactionId?: string; // For Apple, original_transaction_id
  productId: string; // SKU or product identifier
  purchaseDate: Date;
  validationStatus: IapValidationStatus;
  platform: IapPlatform;
  quantity?: number;
  userId?: string; // User who made the purchase, if known at validation time
  originalPlatformResponse: any; // Raw response from Apple/Google for auditing/debugging
  processedDate: Date;
  errorMessage?: string; // If validationStatus is ERROR or INVALID

  constructor(
    transactionId: string,
    productId: string,
    purchaseDate: Date,
    validationStatus: IapValidationStatus,
    platform: IapPlatform,
    originalPlatformResponse: any,
    originalTransactionId?: string,
    quantity?: number,
    userId?: string,
    errorMessage?: string,
  ) {
    this.transactionId = transactionId;
    this.originalTransactionId = originalTransactionId;
    this.productId = productId;
    this.purchaseDate = purchaseDate;
    this.validationStatus = validationStatus;
    this.platform = platform;
    this.originalPlatformResponse = originalPlatformResponse;
    this.quantity = quantity;
    this.userId = userId;
    this.processedDate = new Date();
    this.errorMessage = errorMessage;
  }
}