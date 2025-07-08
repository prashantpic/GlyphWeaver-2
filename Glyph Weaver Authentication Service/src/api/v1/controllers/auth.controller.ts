import { Request, Response, NextFunction } from 'express';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { AuthService } from '../../../application/services/auth.service';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { LoginEmailDto } from '../dto/LoginEmailDto';
import { LoginPlatformDto } from '../dto/LoginPlatformDto';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';

/**
 * Controller for handling authentication-related HTTP requests.
 * It orchestrates calls to the application services and formats the HTTP response.
 * It remains lean by delegating business logic to the AuthService.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {
    // Bind `this` to ensure context is correct when methods are used as route handlers
    this.register = this.register.bind(this);
    this.loginWithEmail = this.loginWithEmail.bind(this);
    this.loginWithPlatform = this.loginWithPlatform.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  /**
   * Handles user registration requests.
   */
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const registerUserDto = plainToInstance(RegisterUserDto, req.body);
      await validateOrReject(registerUserDto);
      
      const result = await this.authService.registerUser(registerUserDto);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles user login requests via email and password.
   */
  public async loginWithEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginEmailDto = plainToInstance(LoginEmailDto, req.body);
      await validateOrReject(loginEmailDto);

      const tokens = await this.authService.authenticateByEmail(loginEmailDto);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles user login requests via a third-party platform token.
   */
  public async loginWithPlatform(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const loginPlatformDto = plainToInstance(LoginPlatformDto, req.body);
      await validateOrReject(loginPlatformDto);

      const tokens = await this.authService.authenticateByPlatformToken(loginPlatformDto);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles requests to refresh authentication tokens.
   */
  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshTokenDto = plainToInstance(RefreshTokenDto, req.body);
      await validateOrReject(refreshTokenDto);

      const tokens = await this.authService.refreshAuthTokens(refreshTokenDto.refreshToken);
      res.status(200).json(tokens);
    } catch (error) {
      next(error);
    }
  }
}