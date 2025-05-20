import { Router } from 'express';
import { healthController } from '../controllers/HealthController';

const router = Router();

/**
 * @swagger
 * /api/health/live:
 *   get:
 *     summary: Liveness probe.
 *     description: Checks if the application process is running and responsive.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is alive.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is alive.
 *       500:
 *         description: Internal Server Error - Should not happen for a simple liveness check unless the server itself fails.
 */
router.get('/live', healthController.checkLiveness);

/**
 * @swagger
 * /api/health/ready:
 *   get:
 *     summary: Readiness probe.
 *     description: Checks if the application is ready to handle requests (e.g., connected to dependencies).
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Service is ready.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Service is ready.
 *       503:
 *         description: Service Unavailable - Not ready to handle traffic (e.g., dependency issues).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Service is not ready - Cannot connect to Elasticsearch.
 */
router.get('/ready', healthController.checkReadiness);

export default router;