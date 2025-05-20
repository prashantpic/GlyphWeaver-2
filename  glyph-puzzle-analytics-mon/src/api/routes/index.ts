import { Router } from 'express';
import analyticsRoutes from './analytics.routes';
import healthRoutes from './health.routes';
import metricsRoutes from './metrics.routes';
import { version } from '../../../package.json'; // Assuming package.json is at the root

const router = Router();

// Mount specific routers
router.use('/analytics', analyticsRoutes);
router.use('/health', healthRoutes);
router.use('/metrics', metricsRoutes);

// Add a default root route (optional)
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Glyph Puzzle Analytics Monitoring Service API',
    version: version,
  });
});

export default router;