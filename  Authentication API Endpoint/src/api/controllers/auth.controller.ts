import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '../../application/services/authentication.service';
import { RegisterRequestDto } from '../dtos/register-request.dto';
import { LoginRequestDto } from '../dtos/login-request.dto';
import { LinkPlatformRequestDto } from '../dtos/link-platform-request.dto';

/**
 * Handles the HTTP request and response cycle for authentication endpoints.
 * It delegates the core business logic to the AuthenticationService.
 */
export class AuthController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  /**
   * Handles the POST /register endpoint.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The Express next function.
   */
  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registerDto = req.body as RegisterRequestDto;
      const authResponse = await this.authenticationService.register(registerDto, req.ip);
      res.status(201).json(authResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the POST /login endpoint.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The Express next function.
   */
  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginDto = req.body as LoginRequestDto;
      const authResponse = await this.authenticationService.login(loginDto, req.ip);
      res.status(200).json(authResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the POST /refresh endpoint.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The Express next function.
   */
  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const authResponse = await this.authenticationService.refreshAuth(refreshToken);
      res.status(200).json(authResponse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Handles the POST /link-platform endpoint.
   * @param req The Express request object.
   * @param res The Express response object.
   * @param next The Express next function.
   */
  public linkPlatform = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user is attached by the 'protect' middleware
      const userId = req.user!.userId;
      const linkDto = req.body as LinkPlatformRequestDto;
      await this.authenticationService.linkPlatformAccount(userId, linkDto, req.ip);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}