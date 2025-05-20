import mongoose, { Schema } from 'mongoose';

export interface PlayerConsumable {
  itemId: string;
  quantity: number;
}

export const PlayerConsumableSchema = new Schema<PlayerConsumable>({
  itemId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false }); // Embedded schemas typically don't have their own _id unless necessary