import passport from 'passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { AppleStrategy }  from './strategies/apple.strategy';
import { jwtConfig } from '../config/jwt.config';
import { oauthConfig } from '../config/oauth.config';
import { UserPrincipal } from './domain/user-principal.entity'; // Assuming this entity exists
import { IAuthService } from './interfaces/auth.interfaces'; // For type hinting service interaction

// This function would be called in app.ts or index.ts to initialize passport
export const configurePassport = (authService?: IAuthService) => { // authService is optional for this example
    // JWT Strategy
    passport.use(new JwtStrategy(
        {
            jwtFromRequest: JwtStrategy.extractJwt,
            secretOrKey: jwtConfig.secretOrPrivateKey,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
        },
        async (payload: any, done: (error: any, user?: UserPrincipal | false, options?: any) => void) => {
            try {
                // In a real application, you might want to look up the user in the DB
                // or validate the payload further.
                // For this setup, we assume payload directly maps to UserPrincipal or parts of it.
                if (!payload || !payload.userId) {
                    return done(null, false, { message: 'Invalid token payload' });
                }
                const user: UserPrincipal = { // Construct UserPrincipal from payload
                    userId: payload.userId,
                    roles: payload.roles || [],
                    // other claims...
                };
                return done(null, user);
            } catch (error) {
                return done(error, false);
            }
        }
    ));

    // Google OAuth2 Strategy
    passport.use(new GoogleStrategy(
        {
            clientID: oauthConfig.google.clientId,
            clientSecret: oauthConfig.google.clientSecret,
            callbackURL: oauthConfig.google.callbackURL,
            passReqToCallback: false, // Set to true if you need request object in callback
        },
        async (accessToken: string, refreshToken: string | undefined, profile: any, done: (error: any, user?: any, info?: any) => void) => {
            // `profile` contains user information from Google
            // This is where you would typically find or create a user in your database
            // and then call `done(null, userFromDb)`
            // For now, we'll pass a simplified user object or the profile itself
            // The AuthService.processOAuthProfile would handle this logic
            try {
                const userProfile = {
                    provider: 'google',
                    id: profile.id,
                    email: profile.emails && profile.emails[0] ? profile.emails[0].value : undefined,
                    name: profile.displayName,
                    rawProfile: profile,
                };
                // If authService is available, it could be used here for pre-processing or direct user creation
                // For simplicity in this file, we just pass the extracted profile.
                // The actual user creation/retrieval would happen in AuthService.
                return done(null, userProfile);
            } catch (error) {
                return done(error, false);
            }
        }
    ));

    // Sign In with Apple Strategy
    // Note: passport-apple might require `privateKeyString` or `privateKeyPath`
    // Ensure `oauthConfig.apple.privateKey` is correctly formatted (e.g., multiline string with \n)
    if (oauthConfig.apple.clientId && oauthConfig.apple.teamId && oauthConfig.apple.keyId && oauthConfig.apple.privateKey) {
        passport.use(new AppleStrategy(
            {
                clientID: oauthConfig.apple.clientId,
                teamID: oauthConfig.apple.teamId,
                keyID: oauthConfig.apple.keyId,
                privateKeyString: oauthConfig.apple.privateKey, // Or use privateKeyPath
                callbackURL: oauthConfig.apple.callbackURL,
                scope: ['name', 'email'], // Request name and email
                passReqToCallback: false,
            },
            async (accessToken: string, refreshToken: string, idTokenDecoded: any, profile: any, done: (error: any, user?: any, info?: any) => void) => {
                // `idTokenDecoded` contains the validated and decoded ID token from Apple.
                // `profile` might be populated by passport-apple based on idTokenDecoded or be empty.
                // Apple sends user's name and email only on the first authorization.
                try {
                    const userProfile = {
                        provider: 'apple',
                        id: idTokenDecoded.sub, // Subject (user's unique ID)
                        email: idTokenDecoded.email,
                        // Apple may not always return name, handle optional name
                        name: profile?.name ? `${profile.name.firstName} ${profile.name.lastName}`.trim() : undefined,
                        rawProfile: { ...idTokenDecoded, ...profile }, // Combine for more info
                    };
                    return done(null, userProfile);
                } catch (error) {
                    return done(error, false);
                }
            }
        ));
    } else {
        console.warn("Apple OAuth strategy not configured due to missing credentials in oauth.config.ts");
    }


    // If you were using sessions (not typical for JWT-only APIs):
    // passport.serializeUser((user: any, done) => {
    //   done(null, user.userId); // Or whatever unique identifier you use
    // });

    // passport.deserializeUser(async (id: string, done) => {
    //   try {
    //     // const user = await userService.findById(id); // Example user service lookup
    //     // done(null, user);
    //     done(null, { userId: id }); // Simplified for example
    //   } catch (error) {
    //     done(error, null);
    //   }
    // });
};