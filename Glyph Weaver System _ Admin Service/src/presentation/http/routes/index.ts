import { Router } from 'express';
import configurationRouter from './configuration.routes';
import playerDataRouter from './player-data.routes';
import healthRouter from './health.routes';

/**
 * @file Aggregates and exports all defined API routes for the microservice.
 * @namespace GlyphWeaver.Backend.System.Presentation.HTTP.Routes
 */

const mainRouter = Router();

mainRouter.use('/health', healthRouter);
mainRouter.use('/configs', configurationRouter);
mainRouter.use('/player-data', playerDataRouter);

export default mainRouter;