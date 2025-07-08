import { model, Schema, Document } from 'mongoose';

// This is a placeholder for the actual PlayerInventory model, which is likely defined in another service.
// The purpose here is to have a type to work with for the repository logic.
interface IPlayerInventory extends Document {
  userId: Schema.Types.ObjectId;
  type: string;
  keyName: string;
  quantity: number;
}

const PlayerInventorySchema = new Schema({
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'PlayerProfile' },
    keyName: { type: String, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, required: true, default: 0 },
});

PlayerInventorySchema.index({ userId: 1, keyName: 1 }, { unique: true });
const PlayerInventoryModel = model<IPlayerInventory>('PlayerInventory', PlayerInventorySchema);


export interface IGrantedItem {
  keyName: string;
  quantity: number;
}

/**
 * @class PlayerInventoryRepository
 * @description Manages data access for a player's inventory. Its primary role in this context
 * is to reliably grant items or virtual currency after a successful IAP validation.
 */
export class PlayerInventoryRepository {
  /**
   * Grants a list of items to a player's inventory.
   * This operation must be atomic and idempotent to ensure reliability. It uses
   * `findOneAndUpdate` with the `$inc` operator to prevent race conditions and
   * `upsert: true` to create an inventory record if one doesn't already exist for the item.
   * @param {string} userId - The ID of the player to grant items to.
   * @param {IGrantedItem[]} items - An array of items to grant.
   * @returns {Promise<void>}
   */
  public async grantItemsToPlayer(userId: string, items: IGrantedItem[]): Promise<void> {
    if (!items || items.length === 0) {
      return;
    }

    const operations = items.map(item => {
      return PlayerInventoryModel.findOneAndUpdate(
        { userId, keyName: item.keyName },
        { 
          $inc: { quantity: item.quantity },
          $setOnInsert: { type: this.getTypeFromKeyName(item.keyName) } // Example of setting type on creation
        },
        { upsert: true, new: true }
      ).exec();
    });

    await Promise.all(operations);
  }

  /**
   * Helper function to determine item type from its key.
   * In a real system, this logic might be more complex or data-driven.
   * @param keyName The unique key for the item.
   * @returns The type of the item (e.g., 'currency', 'hints').
   */
  private getTypeFromKeyName(keyName: string): string {
    if (keyName.includes('currency')) return 'currency';
    if (keyName.includes('hint')) return 'hints';
    if (keyName.includes('undo')) return 'undos';
    return 'consumable';
  }
}