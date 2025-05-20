import { Strategy as PassportJwtStrategy, ExtractJwt, VerifiedCallback, StrategyOptions } from 'passport-jwt';
import { jwtConfig } from '../../config/jwt.config';
import { UserPrincipal } from '../domain/user-principal.entity'; // Actual UserPrincipal entity
import { JwtPayloadDto } from '../dto/jwt-payload.dto'; // Actual JwtPayloadDto

const options: StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtConfig.secretOrPrivateKey,
    issuer: jwtConfig.issuer,
    audience: jwtConfig.audience, // Ensure audience is configured if used
    algorithms: ['HS256'], // Specify algorithms, default is HS256. For RS256, use publicKey
};

// The verify callback for the JWT strategy
const verifyCallback: (payload: JwtPayloadDto, done: VerifiedCallback) => void = 
    async (payload: JwtPayloadDto, done: VerifiedCallback) => {
    try {
        // Payload is the decoded JWT.
        // Here, you would typically validate the payload further or retrieve the user from a database.
        // For this example, we assume the payload itself contains enough user information (UserPrincipal compatible).
        if (!payload || !payload.userId) {
            return done(null, false, { message: 'Invalid token payload: Missing userId' });
        }

        // Construct or cast to UserPrincipal
        // This assumes JwtPayloadDto is compatible or convertible to UserPrincipal
        const user: UserPrincipal = {
            userId: payload.userId,
            username: payload.username, // Add if present in your JWT payload
            roles: payload.roles || [],
            // any other claims relevant to UserPrincipal
        };
        
        // If user is valid and exists (e.g., after a DB check if needed)
        return done(null, user);
    } catch (error) {
        return done(error, false);
    }
};

export class JwtStrategy extends PassportJwtStrategy {
    constructor() {
        super(options, verifyCallback);
    }

    // Expose the extractor for use in passport.setup.ts if needed, though options usually sufficient
    public static extractJwt(req: any) {
        return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    }
}

// Export an instance if preferred, or class for instantiation in passport.setup
// export const jwtStrategyInstance = new JwtStrategy();