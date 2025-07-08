import { Router } from 'express';
import config from '../config';
import { verifyToken } from '../middleware/auth.middleware';
import { createProxy } from '../middleware/proxy.middleware';
import logger from '../utils/logger';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth Service
 *     description: Authentication related endpoints
 *   - name: Player Service
 *     description: Player data, profile, and inventory management
 *   - name: Leaderboard Service
 *     description: Leaderboard and score submission
 *   - name: IAP Service
 *     description: In-app purchase validation
 *   - name: Game Content Service
 *     description: Game level and content data
 *   - name: Analytics Service
 *     description: Analytics event ingestion
 *   - name: System Service
 *     description: System status and management
 */
const routeConfig = [
  { path: '/auth', target: config.services.auth, requiresAuth: false, tag: 'Auth Service' },
  { path: '/player', target: config.services.player, requiresAuth: true, tag: 'Player Service' },
  { path: '/leaderboards', target: config.services.leaderboard, requiresAuth: true, tag: 'Leaderboard Service' },
  { path: '/iap', target: config.services.iap, requiresAuth: true, tag: 'IAP Service' },
  { path: '/gamecontent', target: config.services.gamecontent, requiresAuth: false, tag: 'Game Content Service' },
  { path: '/analytics', target: config.services.analytics, requiresAuth: true, tag: 'Analytics Service' },
  { path: '/system', target: config.services.system, requiresAuth: false, tag: 'System Service' },
];

/**
 * @swagger
 * /auth/{any}:
 *   all:
 *     tags: [Auth Service]
 *     summary: Proxies requests to the Auth Service.
 *     description: All paths under `/auth` are forwarded to the Auth Service. No authentication is required for this route.
 *     parameters:
 *       - in: path
 *         name: any
 *         schema:
 *           type: string
 *         required: true
 *         description: Any subpath for the auth service (e.g., /login, /register, /jwks.json).
 *     responses:
 *       '2XX':
 *         description: Success response from Auth Service.
 *       '4XX':
 *         description: Client error response from Auth Service.
 *       '5XX':
 *         description: Server error response from Auth Service.
 */

/**
 * @swagger
 * /player/{any}:
 *   all:
 *     tags: [Player Service]
 *     summary: Proxies requests to the Player Service.
 *     description: All paths under `/player` are forwarded to the Player Service. Requires JWT authentication.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: any
 *         schema:
 *           type: string
 *         required: true
 *         description: Any subpath for the player service (e.g., /profile, /inventory).
 *     responses:
 *       '2XX':
 *         description: Success response from Player Service.
 *       '401':
 *         description: Unauthorized, token not provided.
 *       '403':
 *         description: Forbidden, invalid token.
 */

routeConfig.forEach(route => {
  const middlewares = [];

  if (route.requiresAuth) {
    middlewares.push(verifyToken);
  }

  middlewares.push(createProxy(route.target));

  router.use(route.path, ...middlewares);
  logger.info(`Route configured: ${route.path} -> ${route.target} (Auth: ${route.requiresAuth})`);
});

export default router;