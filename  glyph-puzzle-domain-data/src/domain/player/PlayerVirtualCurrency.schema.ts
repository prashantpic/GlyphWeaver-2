import mongoose, { Schema } from 'mongoose';

export interface PlayerVirtualCurrency {
  currencyId: string;
  balance: number;
}

export const PlayerVirtualCurrencySchema = new Schema<PlayerVirtualCurrency>({
  currencyId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
}, { _id: false }); // Embedded schemas typically don't have their own _id unless necessary