import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../../../application/services/auth.service';
import { TokenService } from '../../../application/services/token.service';
import { PlatformTokenValidator } from '../../../application/services/platform-token-validator.service';
import { MongoUserRepository } from '../../../infrastructure/persistence/mongo.user.repository';
import Logger from '../../../infrastructure/logging/logger';

// --- Dependency Injection (Manual Wiring) ---
// In a larger application, a DI container (like InversifyJS or NestJS's) would manage this.
// For this service, we manually instantiate and inject dependencies from the bottom up.

const userRepository = new MongoUserRepository();
const tokenService = new TokenService();
const platformTokenValidator = new PlatformTokenValidator();

const authService = new AuthService(
  userRepository,
  tokenService,
  platformTokenValidator,
  Logger
);

const authController = new AuthController(authService);

// --- Router Definition ---

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and token management
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterUserDto'
 *     responses:
 *       201:
 *         description: User registered successfully.
 *       400:
 *         description: Invalid input data.
 *       409:
 *         description: Email already exists.
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /auth/login/email:
 *   post:
 *     summary: Authenticate a user with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginEmailDto'
 *     responses:
 *       200:
 *         description: Authentication successful.
 *       401:
 *         description: Invalid email or password.
 */
router.post('/login/email', authController.loginWithEmail);

/**
 * @swagger
 * /auth/login/platform:
 *   post:
 *     summary: Authenticate a user with a third-party platform token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginPlatformDto'
 *     responses:
 *       200:
 *         description: Authentication successful.
 *       401:
 *         description: Invalid platform token.
 */
router.post('/login/platform', authController.loginWithPlatform);

/**
 * @swagger
 * /auth/token/refresh:
 *   post:
 *     summary: Issue a new pair of tokens using a refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenDto'
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully.
 *       401:
 *         description: Invalid or expired refresh token.
 */
router.post('/token/refresh', authController.refreshToken);

export default router;