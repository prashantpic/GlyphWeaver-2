import { Request, Response, NextFunction } from 'express';
import { IAuthService }_ from '../../services/interfaces/IAuthService';
import { LoginRequestDTO }_ from './dtos/Login.request.dto';
import { RefreshTokenRequestDTO }_ from './dtos/RefreshToken.request.dto';
import { TokenResponseDTO }_ from './dtos/Token.response.dto';

export class AuthController {
    constructor(private authService: IAuthService) {}

    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: Player login
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequestDTO'
     *     responses:
     *       200:
     *         description: Successfully logged in
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TokenResponseDTO'
     *       400:
     *         description: Invalid input
     *       401:
     *         description: Unauthorized
     */
    public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const loginRequest = req.body as LoginRequestDTO;
            const tokenResponse: TokenResponseDTO = await this.authService.login(loginRequest.identifier, loginRequest.password);
            res.status(200).json(tokenResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /auth/refresh:
     *   post:
     *     summary: Refresh access token
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RefreshTokenRequestDTO'
     *     responses:
     *       200:
     *         description: Successfully refreshed token
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/TokenResponseDTO'
     *       400:
     *         description: Invalid refresh token
     *       401:
     *         description: Unauthorized
     */
    public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const refreshTokenRequest = req.body as RefreshTokenRequestDTO;
            const tokenResponse: TokenResponseDTO = await this.authService.refreshTokens(refreshTokenRequest.refreshToken);
            res.status(200).json(tokenResponse);
        } catch (error) {
            next(error);
        }
    }
}