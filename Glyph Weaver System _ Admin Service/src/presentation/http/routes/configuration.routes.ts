import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { configurationController } from '../../../dependencies';

/**
 * @file Defines routes for configuration management.
 * @description This file instantiates and configures the router for configuration-related endpoints,
 * applying authentication and authorization middleware as specified in the SDS.
 */

const router = Router();

router.get(
  '/',
  authenticate,
  authorize(['ADMIN', 'SUPPORT']),
  configurationController.getAll
);

router.get(
  '/:key',
  authenticate,
  authorize(['ADMIN', 'SUPPORT']),
  configurationController.getByKey
);

router.put(
  '/:key',
  authenticate,
  authorize(['ADMIN']),
  configurationController.update
);

export default router;