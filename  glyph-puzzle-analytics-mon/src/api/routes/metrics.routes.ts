import { Router, Request, Response } from 'express';
import { MetricsService } from '../../services/MetricsService';
import { LoggingService } from '../../services/LoggingService';

const router = Router();

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Exposes Prometheus metrics.
 *     description: Endpoint scraped by Prometheus to collect application metrics.
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Prometheus metrics data.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "# HELP http_requests_total Total number of HTTP requests made.\n# TYPE http_requests_total counter\nhttp_requests_total 100\n..."
 *       500:
 *         description: Error retrieving metrics.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Get the metrics string from the Prometheus registry
    const metrics = await MetricsService.getRegistry().metrics();
    // Send the metrics string with the correct content type
    res.set('Content-Type', MetricsService.getRegistry().contentType);
    res.end(metrics); // Use res.end() for plain text response as per prom-client examples
  } catch (error) {
    LoggingService.error('Error serving metrics:', error as Error);
    res.status(500).send('Error retrieving metrics');
  }
});

export default router;