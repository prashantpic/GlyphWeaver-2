import { IsString, IsNotEmpty, IsEnum, IsOptional, IsBoolean } from 'class-validator';

export enum IapPlatform {
    APPLE = 'apple',
    GOOGLE = 'google',
}

export class ValidateReceiptDto {
    @IsString()
    @IsNotEmpty()
    receiptData: string; // For Apple: base64 receipt. For Google: purchaseToken.

    @IsEnum(IapPlatform)
    @IsNotEmpty()
    platform: IapPlatform;

    @IsString()
    @IsNotEmpty()
    @IsOptional() // Required for Google, optional for Apple (can be inferred from receipt)
    productId?: string;

    @IsString()
    @IsNotEmpty()
    @IsOptional() // Required for Google
    packageName?: string;

    @IsBoolean()
    @IsOptional() // For Apple, to explicitly try sandbox first or indicate client context
    isSandbox?: boolean;

    // For Google, to distinguish product vs subscription validation if using a generic endpoint
    @IsEnum(['product', 'subscription'])
    @IsOptional()
    googlePurchaseType?: 'product' | 'subscription';
}