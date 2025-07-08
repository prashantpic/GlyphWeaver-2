/**
 * @interface IGoogleReceiptData
 * @description Defines the structure of the receipt data object for Android purchases.
 */
export interface IGoogleReceiptData {
  token: string;
  sku: string;
}

/**
 * @class ValidateIapRequestDto
 * @description Defines the structure of the incoming request body for the IAP validation endpoint.
 * This class establishes the API contract for clients.
 */
export class ValidateIapRequestDto {
  /**
   * The platform from which the purchase originated.
   * @type {'ios' | 'android'}
   */
  platform: 'ios' | 'android';

  /**
   * The receipt data from the platform.
   * For 'ios', this is a base64-encoded string.
   * For 'android', this is an object containing the purchase token and SKU.
   * @type {string | IGoogleReceiptData}
   */
  receiptData: string | IGoogleReceiptData;
}

/**
 * @class ValidateIapResponseDto
 * @description Defines the structure of the outgoing response body for the IAP validation endpoint.
 * This provides a consistent response format to the client.
 */
export class ValidateIapResponseDto {
  /**
   * Indicates whether the validation and granting process was successful.
   * @type {boolean}
   */
  success: boolean;

  /**
   * A user-friendly message describing the outcome.
   * @type {string}
   */
  message: string;
  
  /**
   * Optional field for returning additional data to the client if needed in the future.
   * @type {any}
   */
  data?: any;
}