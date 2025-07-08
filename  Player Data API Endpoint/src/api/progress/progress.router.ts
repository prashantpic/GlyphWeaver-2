import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth.middleware.ts';
import { ProgressController } from './progress.controller.ts';
import { ProgressService } from './progress.service.ts';

const progressRouter = Router();

// Instantiate dependencies
const progressService = new ProgressService();
const progressController = new ProgressController(progressService);

// All routes in this router are protected and require authentication.
progressRouter.use(authenticate);

/**
 * @route   GET /api/v1/progress
 * @desc    Retrieves all level progress records for the authenticated player.
 * @access  Private
 */
progressRouter.get('/', (req, res, next) => progressController.handleGetFullProgress(req, res, next));

/**
 * @route   POST /api/v1/progress/sync
 * @desc    Synchronizes a batch of level progress data from the client.
 * @access  Private
 */
// TODO: Add Joi validation middleware for the request body.
progressRouter.post('/sync', (req, res, next) => progressController.handleSynchronizeProgress(req, res, next));


export { progressRouter };