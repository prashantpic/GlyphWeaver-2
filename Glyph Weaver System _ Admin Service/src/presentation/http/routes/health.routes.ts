import { Router } from 'express';
import { healthController } from '../../../dependencies';

/**
 * @file Defines the public health check route.
 * @description This file instantiates and configures the router for the public health check endpoint,
 * which does not require any authentication.
 */

const router = Router();

// This is a public endpoint and does not require authentication or authorization.
router.get('/', healthController.checkHealth);

export default router;