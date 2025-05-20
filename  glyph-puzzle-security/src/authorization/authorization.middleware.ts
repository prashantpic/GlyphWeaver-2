import { Request, Response, NextFunction } from 'express';
import { HttpException } from '../common/exceptions/http-exception';
import { AuditService, AuditEventType, AuditEventDto } from '../audit/audit.service';
import { AUDIT_OUTCOME_FAILURE } from '../common/constants/audit.constants';
import { UserPrincipal } from '../auth/auth.service'; // Assuming UserPrincipal is defined here

// Define AuthorizationException as its file is not in the generation list
export class AuthorizationException extends HttpException {
  constructor(message: string = 'Forbidden') {
    super(403, message);
    Object.setPrototypeOf(this, AuthorizationException.prototype);
  }
}


export class AuthorizationMiddleware {
  constructor(private auditService: AuditService) {}

  // Middleware factory to check for a specific role
  public checkRole = (requiredRole: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = req.user as UserPrincipal | undefined; // Assuming AuthMiddleware populates req.user

      if (!user) {
        await this.logAuthorizationFailure(req, 'No user principal found on request.', { requiredRole });
        next(new HttpException(401, 'Authentication required.')); // Or AuthorizationException
        return;
      }

      if (!user.roles || !user.roles.includes(requiredRole)) {
        await this.logAuthorizationFailure(req, `User does not have required role: ${requiredRole}.`, { userId: user.userId, roles: user.roles, requiredRole });
        next(new AuthorizationException(`Access denied. Required role: ${requiredRole}.`));
        return;
      }

      next();
    };
  };

  // Middleware factory to check for a specific permission
  public checkPermission = (requiredPermission: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      const user = req.user as UserPrincipal | undefined;

      if (!user) {
         await this.logAuthorizationFailure(req, 'No user principal found on request.', { requiredPermission });
        next(new HttpException(401, 'Authentication required.'));
        return;
      }

      // This assumes permissions are stored on the user principal, e.g., user.permissions: string[]
      // The structure of permissions (e.g., direct strings, or more complex objects) depends on your system.
      // For this example, let's assume roles imply permissions, or permissions are directly on `user`.
      // This is a placeholder for actual permission checking logic.
      const hasPermission = user.roles?.includes('admin') || (user as any).permissions?.includes(requiredPermission); // Simplified example

      if (!hasPermission) {
         await this.logAuthorizationFailure(req, `User does not have required permission: ${requiredPermission}.`, { userId: user.userId, permissions: (user as any).permissions, requiredPermission });
        next(new AuthorizationException(`Access denied. Required permission: ${requiredPermission}.`));
        return;
      }

      next();
    };
  };

  private async logAuthorizationFailure(req: Request, reason: string, details: any): Promise<void> {
    const user = req.user as UserPrincipal | undefined;
    const auditEvent: AuditEventDto = {
      eventType: AuditEventType.AUTHORIZATION_FAILURE,
      userId: user?.userId,
      sourceIp: req.ip || req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
      outcome: AUDIT_OUTCOME_FAILURE,
      details: {
        path: req.originalUrl,
        method: req.method,
        reason,
        ...details,
      },
    };
    await this.auditService.logEvent(auditEvent);
  }
}