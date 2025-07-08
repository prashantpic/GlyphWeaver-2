import { Router } from 'express';
import { ProceduralLevelsController } from './procedural-levels.controller';
import { ProceduralLevelService } from '../../../services/procedural-level.service';
import ProceduralLevelRepository from '../../../data/repositories/procedural-level.repository';
import { AuditService } from '../../../services/audit.service';
import { authenticate } from '../../../middleware/auth.middleware';
import { validate } from '../../../middleware/validate.middleware';
import { registerLevelSchema } from './procedural-levels.validation';

// Create a new router instance.
const router = Router();

// --- Dependency Injection Setup ---
// In a larger application, a DI container (like InversifyJS) would manage this.
// For this service, manual instantiation is clear and sufficient.
const auditService = new AuditService();
// The default export of the repository is already an instance.
const proceduralLevelService = new ProceduralLevelService(ProceduralLevelRepository, auditService);
const proceduralLevelsController = new ProceduralLevelsController(proceduralLevelService);

// --- Route Definition ---
// Defines the endpoint for registering a new procedural level instance.
// The route is secured and validated before the controller logic is executed.
router.post(
  '/register',
  authenticate,
  validate(registerLevelSchema),
  proceduralLevelsController.register.bind(proceduralLevelsController)
);

export default router;