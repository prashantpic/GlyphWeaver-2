export interface GrantedItem {
  itemId: string;
  quantity: number;
}

export interface GrantedCurrency {
  currencyId: string;
  amount: number;
}

export class ValidationResponseDTO {
  success!: boolean;
  grantedItems?: GrantedItem[];
  grantedCurrency?: GrantedCurrency[];
  transactionDetails?: any; // Platform-specific transaction details
  errorMessage?: string;
}