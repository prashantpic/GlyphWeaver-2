import { Router } from 'express';
// import { playerRouter } from './player/player.router'; // To be added in a future iteration
import { progressRouter } from './progress/progress.router.ts';
import { inventoryRouter } from './inventory/inventory.router.ts';
import { dataPrivacyRouter } from './data-privacy/dataPrivacy.router.ts';

const mainApiRouter = Router();

/**
 * Aggregates all the individual resource routers into a single,
 * modular main router for the application.
 */

// mainApiRouter.use('/player', playerRouter);
mainApiRouter.use('/progress', progressRouter);
mainApiRouter.use('/inventory', inventoryRouter);
mainApiRouter.use('/data-privacy', dataPrivacyRouter);

export { mainApiRouter };