import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { AuthController } from '../controllers/auth.controller';
import { AuthenticationService } from '../../application/services/authentication.service';
import { validate } from '../middleware/validate.middleware';
import { protect } from '../middleware/protect.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  linkPlatformSchema,
} from '../validation/auth.validation';
import { IPlayerRepository } from '../../application/interfaces/player.repository.interface';
import { IAuditLoggingService } from '../../application/interfaces/audit-logging.service.interface';
import { ITokenService, TokenPayload, TokenPair } from '../../application/interfaces/token.service.interface';
import { IPasswordHasher } from '../../application/interfaces/password-hasher.interface';
import { Player } from '../../domain/player.model';
import { AppConfig } from '../../config';
import { AuditEvent } from '../../domain/audit-event.model';

// --- Dependency Instantiation (In-memory / Concrete Implementations) ---
// In a real application, these would be in separate files in an `infrastructure` layer.
// Repositories are mocked as per the instructions since they are external dependencies.

// Mock Player Repository (In-memory implementation for demonstration)
class InMemoryPlayerRepository implements IPlayerRepository {
  private players: Player[] = [];

  async findByEmail(email: string): Promise<Player | null> {
    const player = this.players.find((p) => p.email === email);
    return player ? { ...player } : null;
  }
  async findById(id: string): Promise<Player | null> {
    const player = this.players.find((p) => p.id === id);
    return player ? { ...player } : null;
  }
  async create(playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt' | 'platformLinks'>): Promise<Player> {
    const newPlayer: Player = {
      ...playerData,
      id: uuidv4(),
      platformLinks: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.players.push(newPlayer);
    return { ...newPlayer };
  }
  async updatePlatformLink(userId: string, platform: string, platformId: string): Promise<Player> {
    // Check for uniqueness constraint violation
    const existingLink = this.players.find(p => p.platformLinks[platform] === platformId);
    if(existingLink && existingLink.id !== userId) {
      const error: any = new Error('Unique constraint violation');
      error.code = 'UNIQUE_CONSTRAINT_VIOLATION';
      throw error;
    }

    const playerIndex = this.players.findIndex((p) => p.id === userId);
    if (playerIndex === -1) throw new Error('Player not found');
    
    this.players[playerIndex].platformLinks[platform] = platformId;
    this.players[playerIndex].updatedAt = new Date();
    return { ...this.players[playerIndex] };
  }
}

// Mock Audit Logging Service (Logs to console)
class ConsoleAuditLogger implements IAuditLoggingService {
  async logEvent(event: Omit<AuditEvent, 'timestamp'>): Promise<void> {
    const logEntry = { ...event, timestamp: new Date().toISOString() };
    console.log('[AUDIT LOG]:', JSON.stringify(logEntry, null, 2));
  }
}

// Concrete Password Hasher Implementation
class BcryptPasswordHasher implements IPasswordHasher {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, AppConfig.BCRYPT_SALT_ROUNDS);
  }
  compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// Concrete Token Service Implementation
class JwtTokenService implements ITokenService {
  generateTokens(payload: TokenPayload): Promise<TokenPair> {
    const accessToken = jwt.sign(payload, AppConfig.JWT_SECRET!, { expiresIn: AppConfig.JWT_EXPIRES_IN });
    const refreshToken = jwt.sign(payload, AppConfig.REFRESH_TOKEN_SECRET!, { expiresIn: AppConfig.REFRESH_TOKEN_EXPIRES_IN });
    return Promise.resolve({ accessToken, refreshToken });
  }
  verifyAccessToken(token: string): Promise<TokenPayload> {
    const payload = jwt.verify(token, AppConfig.JWT_SECRET!) as TokenPayload;
    return Promise.resolve(payload);
  }
  verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = jwt.verify(token, AppConfig.REFRESH_TOKEN_SECRET!) as TokenPayload;
    return Promise.resolve(payload);
  }
}

// Instantiate all dependencies
const playerRepository = new InMemoryPlayerRepository();
const auditLogger = new ConsoleAuditLogger();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();
const authenticationService = new AuthenticationService(
  playerRepository,
  auditLogger,
  tokenService,
  passwordHasher
);
const authController = new AuthController(authenticationService);

// --- Router Definition ---
const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/link-platform', protect, validate(linkPlatformSchema), authController.linkPlatform);

export { router as authRoutes };