import { RegisterRequestDto } from '../../api/dtos/register-request.dto';
import { LoginRequestDto } from '../../api/dtos/login-request.dto';
import { AuthResponseDto } from '../../api/dtos/auth-response.dto';
import { LinkPlatformRequestDto } from '../../api/dtos/link-platform-request.dto';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import { IAuditLoggingService } from '../interfaces/audit-logging.service.interface';
import { IPasswordHasher } from '../interfaces/password-hasher.interface';
import { IPlayerRepository } from '../interfaces/player.repository.interface';
import { ITokenService } from '../interfaces/token.service.interface';

/**
 * Implements the core business logic for user authentication. It orchestrates
 * interactions with repositories and helper services to securely manage all
 * authentication and account management tasks.
 */
export class AuthenticationService {
  constructor(
    private readonly playerRepository: IPlayerRepository,
    private readonly auditLogger: IAuditLoggingService,
    private readonly tokenService: ITokenService,
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  /**
   * Registers a new user account.
   * @param registerDto - The registration data.
   * @param ipAddress - The IP address of the user registering.
   * @returns A promise that resolves to an object with the new user's ID and auth tokens.
   */
  public async register(
    registerDto: RegisterRequestDto,
    ipAddress: string
  ): Promise<AuthResponseDto> {
    const existingPlayer = await this.playerRepository.findByEmail(registerDto.email);
    if (existingPlayer) {
      throw new ConflictError('A user with this email already exists.');
    }

    const passwordHash = await this.passwordHasher.hash(registerDto.password);

    const newPlayer = await this.playerRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash,
    });

    const tokens = await this.tokenService.generateTokens({ userId: newPlayer.id });

    await this.auditLogger.logEvent({
      eventType: 'REGISTER_SUCCESS',
      userId: newPlayer.id,
      ipAddress,
      details: { email: newPlayer.email },
    });

    return {
      userId: newPlayer.id,
      ...tokens,
    };
  }

  /**
   * Authenticates a user with their credentials.
   * @param loginDto - The login data (email and password).
   * @param ipAddress - The IP address of the user logging in.
   * @returns A promise that resolves to an auth response DTO with new tokens.
   */
  public async login(
    loginDto: LoginRequestDto,
    ipAddress: string
  ): Promise<AuthResponseDto> {
    const player = await this.playerRepository.findByEmail(loginDto.email);

    if (!player) {
      await this.auditLogger.logEvent({
        eventType: 'LOGIN_FAILURE',
        userId: null,
        ipAddress,
        details: { reason: 'User not found', email: loginDto.email },
      });
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isPasswordValid = await this.passwordHasher.compare(
      loginDto.password,
      player.passwordHash
    );

    if (!isPasswordValid) {
      await this.auditLogger.logEvent({
        eventType: 'LOGIN_FAILURE',
        userId: player.id,
        ipAddress,
        details: { reason: 'Invalid password', email: loginDto.email },
      });
      throw new UnauthorizedError('Invalid email or password.');
    }

    const tokens = await this.tokenService.generateTokens({ userId: player.id });

    await this.auditLogger.logEvent({
      eventType: 'LOGIN_SUCCESS',
      userId: player.id,
      ipAddress,
      details: {},
    });

    return {
      userId: player.id,
      ...tokens,
    };
  }

  /**
   * Issues a new pair of access and refresh tokens using a valid refresh token.
   * @param refreshToken - The refresh token provided by the user.
   * @returns A promise that resolves to a new auth response DTO.
   */
  public async refreshAuth(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      
      const player = await this.playerRepository.findById(payload.userId);
      if (!player) {
        throw new UnauthorizedError('User associated with this token no longer exists.');
      }

      const newTokens = await this.tokenService.generateTokens({ userId: player.id });
      
      await this.auditLogger.logEvent({
        eventType: 'TOKEN_REFRESH_SUCCESS',
        userId: player.id,
        ipAddress: 'N/A', // IP may not be available in this context
        details: {},
      });

      return {
        userId: player.id,
        ...newTokens,
      };
    } catch (error) {
      throw new UnauthorizedError('Refresh token is invalid, expired, or revoked.');
    }
  }

  /**
   * Links a platform-specific account to an existing user account.
   * @param userId - The ID of the authenticated user.
   * @param linkDto - The platform linking data.
   * @param ipAddress - The IP address of the user.
   */
  public async linkPlatformAccount(
    userId: string,
    linkDto: LinkPlatformRequestDto,
    ipAddress: string
  ): Promise<void> {
    try {
        await this.playerRepository.updatePlatformLink(userId, linkDto.platform, linkDto.platformId);
    
        await this.auditLogger.logEvent({
            eventType: 'PLATFORM_LINK_SUCCESS',
            userId,
            ipAddress,
            details: { platform: linkDto.platform, platformId: linkDto.platformId },
        });
    } catch(error: any) {
        // Assuming the repository throws an error with a specific name/code for constraint violations
        if (error.code === 'UNIQUE_CONSTRAINT_VIOLATION') {
            throw new ConflictError('This platform account is already linked to another user.');
        }
        throw error;
    }
  }
}