import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth.middleware.ts';
import { InventoryController } from './inventory.controller.ts';
import { InventoryService } from './inventory.service.ts';

const inventoryRouter = Router();

// Instantiate dependencies
const inventoryService = new InventoryService();
const inventoryController = new InventoryController(inventoryService);

// All routes in this router are protected.
inventoryRouter.use(authenticate);

/**
 * @route   GET /api/v1/inventory
 * @desc    Retrieves the server-authoritative inventory for the authenticated player.
 * @access  Private
 */
inventoryRouter.get('/', (req, res, next) => inventoryController.handleGetInventory(req, res, next));

export { inventoryRouter };