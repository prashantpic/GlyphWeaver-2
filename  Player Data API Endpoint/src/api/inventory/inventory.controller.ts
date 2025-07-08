import { Request, Response, NextFunction } from 'express';
import { InventoryService } from './inventory.service';
import { ApiError } from '../../core/errors/ApiError.ts';

/**
 * The presentation layer for the player inventory resource, managing HTTP
 * requests and invoking the InventoryService.
 */
export class InventoryController {
    
    constructor(private inventoryService: InventoryService) {}

    /**
     * Handles the GET request to retrieve the player's inventory.
     */
    public async handleGetInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const playerId = req.user!.id;
            if (!playerId) {
                // This case should be prevented by the auth middleware
                throw new ApiError(401, 'Unauthorized');
            }
            const inventory = await this.inventoryService.getPlayerInventory(playerId);
            res.status(200).json(inventory);
        } catch (error) {
            next(error);
        }
    }
}