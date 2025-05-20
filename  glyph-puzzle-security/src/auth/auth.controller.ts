import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthService, IOAuthUserProfile, TokenResponseDto } from './auth.service';
import { logger } from '../common/utils/logger.util';
import config from '../config'; // Main config for redirect URLs

export class AuthController {
  constructor(private authService: AuthService) {}

  // --- Google OAuth ---
  public googleOAuthLogin = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('google', { scope: config.oauth.google.scope })(req, res, next);
  };

  public googleOAuthCallback = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('google', { failureRedirect: '/login/failed', session: false }, // session: false for API
      async (err: Error, userProfile: IOAuthUserProfile, info: any) => {
        if (err) {
          logger.error('Google OAuth callback error:', err);
          await this.authService.handleOAuthLoginFailure('google', err, req);
          // Redirect to a frontend failure page or return JSON error
          return res.status(500).json({ message: 'Google authentication failed.', error: err.message });
        }
        if (!userProfile) {
          const failureError = new Error(info?.message || 'Google authentication failed, no profile returned.');
          logger.warn('Google OAuth callback: No user profile returned.');
          await this.authService.handleOAuthLoginFailure('google', failureError, req);
          return res.status(401).json({ message: info?.message || 'Google authentication failed.' });
        }
        
        try {
          const userPrincipal = await this.authService.processOAuthProfile('google', userProfile, req);
          const tokens: TokenResponseDto = this.authService.issueTokens(userPrincipal);
          // Instead of redirecting with token in query (less secure),
          // ideally, set cookies (HttpOnly, Secure) or return JSON for SPA to handle.
          // For this example, returning JSON.
          res.json(tokens);
        } catch (processingError) {
          const castError = processingError as Error;
          logger.error('Error processing Google OAuth profile:', castError);
          await this.authService.handleOAuthLoginFailure('google', castError, req);
          return res.status(500).json({ message: 'Error processing authentication.', error: castError.message });
        }
      }
    )(req, res, next);
  };

  // --- Apple OAuth ---
  public appleOAuthLogin = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate('apple', { scope: config.oauth.apple.scope })(req, res, next);
  };

  public appleOAuthCallback = (req: Request, res: Response, next: NextFunction): void => {
     // Sign In with Apple often uses POST for callback and `req.body` contains user data and identityToken.
     // Passport-apple strategy should handle this.
    passport.authenticate('apple', { failureRedirect: '/login/failed', session: false },
      async (err: Error, userProfile: IOAuthUserProfile, info: any) => { // userProfile here is what passport-apple's verify callback returns
        if (err) {
          logger.error('Apple OAuth callback error:', err);
          await this.authService.handleOAuthLoginFailure('apple', err, req);
          return res.status(500).json({ message: 'Apple authentication failed.', error: err.message });
        }
        if (!userProfile) {
          const failureError = new Error(info?.message || 'Apple authentication failed, no profile returned.');
          logger.warn('Apple OAuth callback: No user profile returned.');
          await this.authService.handleOAuthLoginFailure('apple', failureError, req);
          return res.status(401).json({ message: info?.message || 'Apple authentication failed.' });
        }

        try {
          const userPrincipal = await this.authService.processOAuthProfile('apple', userProfile, req);
          const tokens = this.authService.issueTokens(userPrincipal);
          res.json(tokens);
        } catch (processingError) {
          const castError = processingError as Error;
          logger.error('Error processing Apple OAuth profile:', castError);
          await this.authService.handleOAuthLoginFailure('apple', castError, req);
          return res.status(500).json({ message: 'Error processing authentication.', error: castError.message });
        }
      }
    )(req, res, next);
  };
  
  // --- Token Refresh ---
  public refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Assuming refresh token is sent in request body: e.g., { refreshToken: "..." }
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token is required.' });
      return;
    }

    try {
      const tokens = await this.authService.refreshToken(refreshToken, req);
      res.json(tokens);
    } catch (error) {
        // AuthService.refreshToken should log audit events for failure
        // Error should be an instance of HttpException or similar for proper status
        if ((error as Error).message.includes('Invalid or expired refresh token') || 
            (error as Error).message.includes('User not found or refresh token revoked')) {
            res.status(401).json({ message: 'Invalid or expired refresh token.' });
        } else {
            logger.error('Token refresh error:', error);
            res.status(500).json({ message: 'Failed to refresh token.' });
        }
    }
  };
}