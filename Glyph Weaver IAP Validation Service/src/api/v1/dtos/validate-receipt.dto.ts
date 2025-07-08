import { IsString, IsNotEmpty, IsIn, IsUUID } from 'class-validator';

/**
 * @class ValidateReceiptDto
 * @description Data Transfer Object for the IAP validation request.
 * It defines the expected structure of the request body and uses decorators
 * from the `class-validator` library to enforce validation rules. This ensures
 * that incoming data is well-formed before it reaches the application service.
 */
export class ValidateReceiptDto {
    /**
     * @property receiptData
     * @description The raw, base64-encoded receipt data from the Apple App Store
     * or the purchase token from the Google Play Store.
     */
    @IsString()
    @IsNotEmpty()
    receiptData: string;

    /**
     * @property sku
     * @description The Stock Keeping Unit (SKU) or product ID of the item being purchased.
     * This is used as an additional verification step.
     */
    @IsString()
    @IsNotEmpty()
    sku: string;

    /**
     * @property platform
     * @description The platform from which the purchase originated. Must be either 'ios' or 'android'.
     */
    @IsIn(['ios', 'android'])
    platform: 'ios' | 'android';

    /**
     * @property userId
     * @description The unique identifier (UUID) of the user making the purchase.
     */
    @IsUUID()
    userId: string;
}