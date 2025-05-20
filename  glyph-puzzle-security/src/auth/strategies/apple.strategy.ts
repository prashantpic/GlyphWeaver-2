import { Strategy as PassportAppleStrategy, StrategyOption, Profile, VerifyCallback } from 'passport-apple';
import { oauthConfig } from '../../config/oauth.config';
import { IOAuthUserProfile } from '../interfaces/auth.interfaces';

const strategyOptions: StrategyOption = {
    clientID: oauthConfig.apple.clientId, // This is usually your service ID (Bundle ID for app)
    teamID: oauthConfig.apple.teamId,
    keyID: oauthConfig.apple.keyId,
    privateKeyString: oauthConfig.apple.privateKey, // Ensure this is the raw private key string
    callbackURL: oauthConfig.apple.callbackURL,
    scope: ['name', 'email'], // Request name and email. User can choose not to share.
    passReqToCallback: false,
};

const verifyCallback: VerifyCallback = async (
    accessToken: string,
    refreshToken: string, // Apple provides refresh token
    idTokenDecoded: any, // Decoded id_token (JWT payload)
    profile: Profile | undefined, // Profile might be sparse or undefined, rely on idTokenDecoded
    done: (error: any, user?: IOAuthUserProfile | false, info?: any) => void
) => {
    try {
        // `idTokenDecoded` contains the primary user information.
        // Apple specific: `email_verified` and `is_private_email` are important fields in `idTokenDecoded`.
        // `name` and `email` are only sent by Apple on the first authentication for a given user & app.
        // Subsequent authentications will not include them in the `id_token` unless `scope` is re-requested.
        // `profile` from `passport-apple` might parse some of this, but `idTokenDecoded` is more reliable.

        const userEmail = idTokenDecoded.email;
        const userName = profile?.name; // passport-apple attempts to parse name from form post if available

        const userProfile: IOAuthUserProfile = {
            provider: 'apple',
            id: idTokenDecoded.sub, // User's unique subject identifier
            displayName: userName ? `${userName.firstName || ''} ${userName.lastName || ''}`.trim() : undefined,
            name: userName ? {
                familyName: userName.lastName,
                givenName: userName.firstName,
            } : undefined,
            emails: userEmail ? [{ value: userEmail, verified: idTokenDecoded.email_verified === 'true' || idTokenDecoded.email_verified === true }] : [],
            rawProfile: { ...idTokenDecoded, originalProfile: profile }, // Store all raw data
            accessToken,
            refreshToken,
        };
        
        return done(null, userProfile);

    } catch (error) {
        return done(error, false);
    }
};


export class AppleStrategy extends PassportAppleStrategy {
    constructor() {
         // Check if Apple OAuth is configured
        if (!oauthConfig.apple.clientId || !oauthConfig.apple.teamId || !oauthConfig.apple.keyId || !oauthConfig.apple.privateKey) {
            console.warn('Apple OAuth strategy is not fully configured. Missing credentials.');
            // Similar to GoogleStrategy, handle unconfigured state
            super({ clientID: '', teamID: '', keyID: '', privateKeyString: '', callbackURL: '' }, async () => {}); // Dummy
            return; 
        }
        super(strategyOptions, verifyCallback);
    }
}

// Export an instance if preferred
// export const appleStrategyInstance = new AppleStrategy();