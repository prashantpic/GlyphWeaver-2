import { IsBoolean, IsString, IsOptional, IsDate, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PurchaseDetailsDto {
    @IsString()
    @IsNotEmpty()
    transactionId: string;

    @IsString()
    @IsNotEmpty()
    productId: string;

    @IsDate()
    @Type(() => Date)
    purchaseDate: Date;

    @IsString()
    @IsOptional()
    originalTransactionId?: string;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    originalPurchaseDate?: Date;
    
    @IsBoolean()
    @IsOptional()
    isTrialPeriod?: boolean;

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    expiresDate?: Date; // For subscriptions

    // Add other relevant normalized fields here
}


export class ValidationResultDto {
    @IsBoolean()
    isValid: boolean;

    @ValidateNested()
    @Type(() => PurchaseDetailsDto)
    @IsOptional()
    purchase?: PurchaseDetailsDto; // Contains normalized purchase info if valid

    // List of purchases if the receipt contains multiple (e.g. Apple subscriptions)
    @ValidateNested({ each: true })
    @Type(() => PurchaseDetailsDto)
    @IsOptional()
    purchases?: PurchaseDetailsDto[]; 

    @IsString()
    @IsOptional()
    errorMessage?: string;

    @IsOptional() // Can be number (Apple status) or string (Google error code)
    errorCode?: number | string;

    @IsString()
    @IsOptional()
    environment?: 'Production' | 'Sandbox'; // For Apple

    @IsOptional()
    rawResponse?: any; // For debugging or further client processing

    constructor(
        isValid: boolean,
        purchase?: PurchaseDetailsDto,
        purchases?: PurchaseDetailsDto[],
        errorMessage?: string,
        errorCode?: number | string,
        environment?: 'Production' | 'Sandbox',
        rawResponse?: any,
    ) {
        this.isValid = isValid;
        this.purchase = purchase;
        this.purchases = purchases;
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
        this.environment = environment;
        this.rawResponse = rawResponse;
    }
}