import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { playerDataController } from '../../../dependencies';

/**
 * @file Defines routes for player data privacy requests.
 * @description This file instantiates and configures the router for endpoints related to
 * GDPR/CCPA data subject rights, applying authentication and authorization middleware.
 */

const router = Router();

router.post(
  '/access-request',
  authenticate,
  authorize(['SUPPORT']),
  playerDataController.requestAccess
);

router.post(
  '/delete-request',
  authenticate,
  authorize(['SUPPORT']),
  playerDataController.requestDeletion
);

export default router;