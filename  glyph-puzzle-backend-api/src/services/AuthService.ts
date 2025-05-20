import { IAuthService } from './interfaces/IAuthService';
import { IPlayerRepository } from './interfaces/IPlayerRepository';
import { ISecurityService } from './interfaces/ISecurityService';
import { LoginRequestDTO, TokenResponseDTO, RefreshTokenRequestDTO } from '../api/auth/dtos'; // Assuming DTOs are in src/api/auth/dtos
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export class AuthService implements IAuthService {
    constructor(
        private playerRepository: IPlayerRepository,
        private securityService: ISecurityService
    ) {}

    async login(credentials: LoginRequestDTO): Promise<TokenResponseDTO> {
        logger.info(`Login attempt for identifier: ${credentials.identifier}`);
        const player = await this.playerRepository.findByIdentifier(credentials.identifier);

        if (!player) {
            logger.warn(`Login failed: Player not found for identifier ${credentials.identifier}`);
            throw new ApiError('Invalid credentials', 401);
        }

        const isPasswordValid = await this.securityService.comparePassword(credentials.password, player.passwordHash);
        if (!isPasswordValid) {
            logger.warn(`Login failed: Invalid password for player ${player.id}`);
            throw new ApiError('Invalid credentials', 401);
        }

        if (player.isDeleted) {
            logger.warn(`Login failed: Account deleted for player ${player.id}`);
            throw new ApiError('Account is deleted', 403);
        }

        const tokens = await this.securityService.generateAuthTokens({ userId: player.id, role: player.role || 'player' });

        // Store refresh token securely, associate with user
        await this.playerRepository.updateRefreshToken(player.id, tokens.refreshToken, new Date(Date.now() + this.securityService.getRefreshTokenExpiryMs()));

        logger.info(`Login successful for player ${player.id}`);
        return tokens;
    }

    async refreshTokens(refreshTokenRequest: RefreshTokenRequestDTO): Promise<TokenResponseDTO> {
        const { refreshToken } = refreshTokenRequest;
        logger.info('Attempting to refresh tokens');

        const decoded = await this.securityService.verifyRefreshToken(refreshToken);
        if (!decoded || !decoded.userId) {
            logger.warn('Refresh token verification failed or userId missing');
            throw new ApiError('Invalid refresh token', 401);
        }

        const player = await this.playerRepository.findById(decoded.userId);
        if (!player) {
            logger.warn(`Refresh token: Player not found for userId ${decoded.userId}`);
            throw new ApiError('Invalid refresh token', 401);
        }

        if (player.isDeleted) {
            logger.warn(`Refresh token: Account deleted for player ${player.id}`);
            throw new ApiError('Account is deleted', 403);
        }
        
        const isValidRefreshToken = await this.playerRepository.validateRefreshToken(player.id, refreshToken);
        if(!isValidRefreshToken) {
            logger.warn(`Refresh token: Stored token mismatch or expired for player ${player.id}`);
            throw new ApiError('Invalid or expired refresh token', 401);
        }

        const newTokens = await this.securityService.generateAuthTokens({ userId: player.id, role: player.role || 'player' });

        // Update the stored refresh token
        await this.playerRepository.updateRefreshToken(player.id, newTokens.refreshToken, new Date(Date.now() + this.securityService.getRefreshTokenExpiryMs()));

        logger.info(`Tokens refreshed successfully for player ${player.id}`);
        return newTokens;
    }
}