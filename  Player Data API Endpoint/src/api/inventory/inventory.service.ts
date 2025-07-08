import { PlayerInventoryModel } from '../../data/models/playerInventory.model.ts';
import { ApiError } from '../../core/errors/ApiError.ts';
import { Types } from 'mongoose';

/**
 * Provides the business logic for managing a player's virtual currency and
 * consumable items in a secure, server-authoritative manner.
 */
export class InventoryService {
    
    /**
     * Retrieves the server-authoritative inventory for the authenticated player.
     * @param playerId - The ID of the authenticated player.
     * @returns The player's inventory.
     */
    public async getPlayerInventory(playerId: string) {
        const inventoryRecords = await PlayerInventoryModel.find({ userId: new Types.ObjectId(playerId) })
            .select('itemId type quantity -_id') // Use type instead of itemType to match spec
            .lean();
        
        // The SDS implies 404 if no records, but an empty inventory is also a valid state.
        // We will return an empty array if nothing is found, which is more robust for clients.
        // if (!inventoryRecords || inventoryRecords.length === 0) {
        //     throw new ApiError(404, "Player inventory not found.");
        // }

        return { inventory: inventoryRecords };
    }

    /**
     * Atomically updates a player's quantity for a specific inventory item.
     * This method is intended for internal use by other services (e.g., IAP, Rewards).
     * @param playerId - The ID of the player.
     * @param itemId - The unique ID of the item to update.
     * @param itemType - The type of the item.
     * @param changeAmount - The amount to change the quantity by (can be negative).
     * @returns The updated inventory item.
     */
    public async updatePlayerInventory(playerId: string, itemId: string, itemType: 'currency' | 'consumable', changeAmount: number) {
        const query = {
            userId: new Types.ObjectId(playerId),
            itemId: itemId,
        };

        // Prevent quantity from going below zero if decrementing
        if (changeAmount < 0) {
            (query as any).quantity = { $gte: -changeAmount };
        }

        const update = {
            $inc: { quantity: changeAmount },
            $setOnInsert: { itemType: itemType } // Set type only when creating document
        };

        const updatedItem = await PlayerInventoryModel.findOneAndUpdate(
            query,
            update,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        if (!updatedItem && changeAmount < 0) {
            throw new ApiError(400, `Insufficient quantity for item ${itemId}.`);
        }

        return updatedItem;
    }
}