import { Strategy as PassportGoogleStrategy, StrategyOptions, VerifyCallback, Profile } from 'passport-google-oauth20';
import { oauthConfig } from '../../config/oauth.config';
import { IOAuthUserProfile } from '../interfaces/auth.interfaces';

const strategyOptions: StrategyOptions = {
    clientID: oauthConfig.google.clientId,
    clientSecret: oauthConfig.google.clientSecret,
    callbackURL: oauthConfig.google.callbackURL,
    scope: ['profile', 'email'], // Default scopes, can be configured
    passReqToCallback: false, // Set to true if you need access to the request object in the verify callback
};

const verifyCallback: VerifyCallback = async (
    accessToken: string,
    refreshToken: string | undefined, // May not always be provided
    profile: Profile,
    done: (error: any, user?: IOAuthUserProfile | false, info?: any) => void
) => {
    try {
        // `profile` contains user information from Google.
        // Extract necessary information to form a standardized user profile.
        const userProfile: IOAuthUserProfile = {
            provider: 'google',
            id: profile.id,
            displayName: profile.displayName,
            name: {
                familyName: profile.name?.familyName,
                givenName: profile.name?.givenName,
            },
            emails: profile.emails?.map(email => ({ value: email.value, verified: email.verified || false })),
            photos: profile.photos?.map(photo => ({ value: photo.value })),
            rawProfile: profile, // Store the original profile for additional data
            accessToken, // Optionally store access token if needed for further API calls to Google
            refreshToken, // Optionally store refresh token if needed
        };
        
        // The AuthService will be responsible for finding or creating a user in the database based on this profile.
        // For the strategy, we just pass the processed profile to the `done` callback.
        return done(null, userProfile);

    } catch (error) {
        return done(error, false);
    }
};

export class GoogleStrategy extends PassportGoogleStrategy {
    constructor() {
        // Check if Google OAuth is configured
        if (!oauthConfig.google.clientId || !oauthConfig.google.clientSecret) {
            console.warn('Google OAuth strategy is not fully configured. Missing clientID or clientSecret.');
            // Potentially throw an error or handle this case,
            // but for now, passport.use will simply not register it if it's not instantiated.
            // This constructor will still be called if `new GoogleStrategy()` is invoked.
            // A check should be done before `passport.use(new GoogleStrategy())`.
            super({ clientID: '', clientSecret: '', callbackURL: '' }, async () => {}); // Dummy super call
            // Or throw new Error('Google OAuth not configured');
            return; // Prevent further execution if not configured
        }
        super(strategyOptions, verifyCallback as any); // Cast to any due to mismatch in type def for verify
    }
}

// Export an instance if preferred
// export const googleStrategyInstance = new GoogleStrategy();