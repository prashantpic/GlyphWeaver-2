import { GrantedItem, GrantedCurrency } from '../iap/dtos/Validation.response.dto'; // Re-using these for consistency

export class RewardResponseDTO {
  success!: boolean;
  grantedItems?: GrantedItem[];
  grantedCurrency?: GrantedCurrency[];
  errorMessage?: string;
}