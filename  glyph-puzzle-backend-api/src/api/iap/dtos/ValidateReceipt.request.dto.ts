import { IsString, IsNotEmpty, IsIn, IsOptional } from 'class-validator';

export class ValidateReceiptRequestDTO {
  @IsString()
  @IsIn(['apple', 'google'])
  platform!: 'apple' | 'google';

  @IsString()
  @IsNotEmpty()
  receiptData!: string; // This could be the receipt token or data string

  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  transactionId?: string; // Often required for Google Play, optional for Apple uniqueness check
}