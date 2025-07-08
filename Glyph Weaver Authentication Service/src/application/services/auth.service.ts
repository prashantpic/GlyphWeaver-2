import { Logger } from 'winston';
import { LoginEmailDto } from '../../api/v1/dto/LoginEmailDto';
import { LoginPlatformDto } from '../../api/v1/dto/LoginPlatformDto';
import { RegisterUserDto } from '../../api/v1/dto/RegisterUserDto';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ConflictException, UnauthorizedException } from '../../api/v1/middleware/error.handler';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { IPlatformTokenValidator } from './platform-token-validator.service';
import { IUser } from '../../domain/models/user.model';

/**
 * Core application service for handling all authentication and user identity logic.
 * It orchestrates calls to repositories and other services to fulfill auth use cases.
 */
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly platformTokenValidator: IPlatformTokenValidator,
    private readonly logger: Logger
  ) {}

  /**
   * Registers a new user with an email and password.
   * @param dto - The user registration data.
   * @returns The created user object (sanitized) and a pair of auth tokens.
   */
  public async registerUser(dto: RegisterUserDto) {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const passwordHash = await PasswordService.hashPassword(dto.password);
    const newUser = { email: dto.email.toLowerCase(), passwordHash };

    const createdUser = await this.userRepository.create(newUser);

    const tokens = await this.tokenService.generateAuthTokens({ userId: createdUser.id });

    this.logger.info(`New user registered: ${createdUser.email} (ID: ${createdUser.id})`, { eventId: 'REQ-SEC-019' });

    // Sanitize user object before returning
    const userResponse = {
      id: createdUser.id,
      email: createdUser.email,
    };

    return { user: userResponse, tokens };
  }

  /**
   * Authenticates a user with their email and password.
   * @param dto - The user login data.
   * @returns A pair of new auth tokens.
   */
  public async authenticateByEmail(dto: LoginEmailDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      this.logger.warn(`Failed login attempt for email: ${dto.email} (user not found or no password)`, { eventId: 'REQ-SEC-019' });
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await PasswordService.comparePassword(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Failed login attempt for email: ${dto.email} (invalid password)`, { eventId: 'REQ-SEC-019' });
      throw new UnauthorizedException('Invalid email or password.');
    }

    const tokens = await this.tokenService.generateAuthTokens({ userId: user.id });
    await this.userRepository.update(user.id, { lastLoginAt: new Date() });

    this.logger.info(`User logged in successfully (email): ${user.email}`, { eventId: 'REQ-SEC-019' });
    return tokens;
  }

  /**
   * Authenticates or registers a user via a third-party platform token.
   * @param dto - The platform login data containing the platform name and token.
   * @returns A pair of new auth tokens.
   */
  public async authenticateByPlatformToken(dto: LoginPlatformDto) {
    const { platformUserId, email } = await this.platformTokenValidator.validate(dto.platform, dto.token);

    let user = await this.userRepository.findByPlatformId(dto.platform, platformUserId);

    if (!user && email) {
      // User not found by platform ID, try to link to an existing account via email.
      const existingUserByEmail = await this.userRepository.findByEmail(email);
      if (existingUserByEmail) {
        existingUserByEmail.platformIdentities.push({ provider: dto.platform, providerUserId });
        user = await this.userRepository.update(existingUserByEmail.id, { platformIdentities: existingUserByEmail.platformIdentities });
        this.logger.info(`Linked new platform identity '${dto.platform}' to existing user: ${email}`);
      }
    }

    if (!user) {
      // If still no user, create a new one.
      user = await this.userRepository.create({
        email: email ? email.toLowerCase() : undefined,
        platformIdentities: [{ provider: dto.platform, providerUserId }],
      });
      this.logger.info(`Created new user via platform login: ${dto.platform} (ID: ${user!.id})`);
    }

    const tokens = await this.tokenService.generateAuthTokens({ userId: user!.id });
    await this.userRepository.update(user!.id, { lastLoginAt: new Date() });

    this.logger.info(`User logged in successfully (platform): ${dto.platform} (ID: ${user!.id})`, { eventId: 'REQ-SEC-019' });
    return tokens;
  }

  /**
   * Issues a new pair of tokens using a valid refresh token.
   * @param refreshToken - The refresh token provided by the client.
   * @returns A new pair of auth tokens.
   */
  public async refreshAuthTokens(refreshToken: string) {
    const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
    
    const user = await this.userRepository.findById(userId);
    if (!user) {
      this.logger.error(`Refresh token validated for non-existent user ID: ${userId}`);
      throw new UnauthorizedException('User not found.');
    }

    const newTokens = await this.tokenService.generateAuthTokens({ userId: user.id });
    this.logger.info(`Tokens refreshed for user ID: ${user.id}`);
    
    return newTokens;
  }
}