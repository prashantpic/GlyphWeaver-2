import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthenticationException } from '../../common/exceptions/authentication.exception';
import { UserPrincipal } from '../domain/user-principal.entity';
import { AuditService } from '../../audit/audit.service'; // Assuming AuditService exists and is injectable
import { AuditEventType } from '../../audit/enums/audit-event-type.enum';
import { appConfig } from '../../config/app.config';

// Placeholder for AuditService instance. In a real app, this would be injected.
const auditServiceInstance: AuditService = AuditService.getInstance(); // Or however it's provided

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('jwt', { session: false }, (err: any, user: UserPrincipal | false, info: any) => {
        const ipAddress = req.ip || req.socket?.remoteAddress;

        if (err) {
            if (auditServiceInstance) {
                auditServiceInstance.logEvent({
                    eventType: AuditEventType.API_KEY_AUTHENTICATION_FAILURE, // Or a more generic JWT auth failure
                    outcome: 'FAILURE',
                    sourceIp: ipAddress,
                    details: { error: err.message, info: info?.message || info?.toString() },
                    actorType: 'System',
                });
            }
            return next(new AuthenticationException(err.message || 'Authentication error'));
        }
        if (!user) {
            let message = 'Unauthorized';
            if (info) {
                if (info.name === 'TokenExpiredError') {
                    message = 'Token expired';
                } else if (info.name === 'JsonWebTokenError') {
                    message = 'Invalid token';
                } else if (info.message) {
                    message = info.message;
                }
            }
            if (auditServiceInstance) {
                auditServiceInstance.logEvent({
                    eventType: AuditEventType.API_KEY_AUTHENTICATION_FAILURE,
                    outcome: 'FAILURE',
                    sourceIp: ipAddress,
                    details: { reason: message, info: info?.toString() },
                    actorType: 'Anonymous',
                });
            }
            return next(new AuthenticationException(message));
        }
        
        // Attach user to request object
        req.user = user;
        
        // Optionally log successful authentication if required, though often implicit
        // if (auditServiceInstance && appConfig.logLevel === 'debug') { // Example condition
        //     auditServiceInstance.logEvent({
        //         eventType: AuditEventType.USER_LOGIN_SUCCESS, // This might be too generic for JWT validation
        //         userId: user.userId,
        //         outcome: 'SUCCESS',
        //         sourceIp: ipAddress,
        //         details: { message: 'JWT authentication successful' },
        //         actorType: 'User',
        //     });
        // }

        next();
    })(req, res, next);
};