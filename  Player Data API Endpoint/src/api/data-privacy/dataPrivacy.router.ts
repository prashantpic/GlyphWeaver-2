import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth.middleware.ts';
import { DataPrivacyController } from './dataPrivacy.controller.ts';
import { DataPrivacyService } from './dataPrivacy.service.ts';
import { AuditService } from '../../services/audit.service.ts';

const dataPrivacyRouter = Router();

// Instantiate dependencies
const auditService = new AuditService();
const dataPrivacyService = new DataPrivacyService(auditService);
const dataPrivacyController = new DataPrivacyController(dataPrivacyService);

// All routes are protected and require user authentication
dataPrivacyRouter.use(authenticate);

/**
 * @route   POST /api/v1/data-privacy/access
 * @desc    Initiates a request for an export of the user's personal data.
 * @access  Private
 */
dataPrivacyRouter.post('/access', (req, res, next) => dataPrivacyController.handleRequestAccess(req, res, next));

/**
 * @route   POST /api/v1/data-privacy/delete
 * @desc    Initiates a request for the deletion of the user's personal data.
 * @access  Private
 */
dataPrivacyRouter.post('/delete', (req, res, next) => dataPrivacyController.handleRequestDeletion(req, res, next));

export { dataPrivacyRouter };