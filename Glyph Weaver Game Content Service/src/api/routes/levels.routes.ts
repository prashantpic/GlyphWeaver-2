import { Router } from 'express';
import { LevelController } from '../controllers/level.controller';

/**
 * Creates and configures the Express Router for level-related endpoints.
 * @param controller An instance of LevelController to handle requests.
 * @returns A configured Express Router.
 */
export const createLevelRoutes = (controller: LevelController): Router => {
    const router = Router();

    /**
     * @route GET /api/v1/levels/zone/:zoneId
     * @description Retrieves a summary list of all hand-crafted levels within a specific zone.
     * @param {string} zoneId - The ID of the zone.
     * @returns {Array<LevelSummaryDto>} 200 - An array of level summaries.
     * @returns {object} 400 - Invalid zone ID format.
     */
    router.get('/zone/:zoneId', controller.getByZone);

    /**
     * @route GET /api/v1/levels/:id
     * @description Retrieves the full configuration for a single hand-crafted level or a procedural template.
     * @param {string} id - The ID of the level.
     * @returns {LevelDetailDto} 200 - The full level configuration.
     * @returns {object} 400 - Invalid level ID format.
     * @returns {object} 404 - Level not found.
     */
    router.get('/:id', controller.getById);

    return router;
};