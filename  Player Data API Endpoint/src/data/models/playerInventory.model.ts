import { Schema, model, Document, Types } from 'mongoose';

type ItemType = 'currency' | 'consumable';

/**
 * Interface for the PlayerInventory document.
 */
export interface IPlayerInventory extends Document {
    userId: Types.ObjectId;
    itemId: string;
    itemType: ItemType;
    quantity: number;
}

const PlayerInventorySchema = new Schema<IPlayerInventory>({
    userId: { type: Schema.Types.ObjectId, ref: 'PlayerProfile', required: true, index: true },
    itemId: { type: String, required: true }, // e.g., 'currency_glyph_orbs', 'consumable_hint'
    itemType: { type: String, required: true, enum: ['currency', 'consumable'] },
    quantity: { type: Number, required: true, min: 0, default: 0 },
}, { timestamps: true });

// Ensure a player has only one inventory entry per item
PlayerInventorySchema.index({ userId: 1, itemId: 1 }, { unique: true });

export const PlayerInventoryModel = model<IPlayerInventory>('PlayerInventory', PlayerInventorySchema);