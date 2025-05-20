import { Request, Response, NextFunction } from 'express';
import { IAdminService }_ from '../../services/interfaces/IAdminService';
import { AdminActionRequestDTO }_ from './dtos/AdminAction.request.dto';

export class AdminController {
    constructor(private adminService: IAdminService) {}

    /**
     * @swagger
     * /admin/health:
     *   get:
     *     summary: Get system health status
     *     tags: [Admin]
     *     security:
     *       - adminApiKeyAuth: [] # Or a different scheme if JWT role based
     *     responses:
     *       200:
     *         description: System health status
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 status:
     *                   type: string
     *                   example: "healthy"
     *                 dependencies:
     *                   type: object
     *                   example: { "database": "ok", "cache": "ok" }
     *       503:
     *         description: Service unavailable (if health check fails critically)
     */
    public async getSystemHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const healthStatus = await this.adminService.getSystemHealth();
            res.status(200).json(healthStatus);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /admin/configs:
     *   get:
     *     summary: Get all game configuration settings
     *     tags: [Admin]
     *     security:
     *       - adminApiKeyAuth: []
     *     responses:
     *       200:
     *         description: All game configurations
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               additionalProperties: true
     *       401:
     *         description: Unauthorized
     */
    public async getConfigurations(_req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const configs = await this.adminService.getConfigurations();
            res.status(200).json(configs);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /admin/config/{key}:
     *   put:
     *     summary: Update a game configuration setting
     *     tags: [Admin]
     *     security:
     *       - adminApiKeyAuth: []
     *     parameters:
     *       - in: path
     *         name: key
     *         required: true
     *         schema:
     *           type: string
     *         description: The configuration key to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AdminActionRequestDTO'
     *     responses:
     *       200:
     *         description: Configuration updated successfully
     *         content:
     *           application/json:
     *             schema:
     *                type: object
     *                properties:
     *                  message:
     *                    type: string
     *                  key:
     *                    type: string
     *                  value: true # represents any type
     *       400:
     *         description: Invalid input or configuration key
     *       401:
     *         description: Unauthorized
     *       404:
     *         description: Configuration key not found
     */
    public async updateConfiguration(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const configKey = req.params.key;
            const { value } = req.body as AdminActionRequestDTO;
            // The admin user performing the action can be logged from req.user.id by the service
            const updatedConfig = await this.adminService.updateConfiguration(configKey, value, req.user?.id);
            res.status(200).json({ message: 'Configuration updated successfully', key: configKey, value: updatedConfig });
        } catch (error) {
            next(error);
        }
    }
}