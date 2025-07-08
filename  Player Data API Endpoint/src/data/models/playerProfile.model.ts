import { Schema, model, Document } from 'mongoose';

/**
 * Interface for the UserSettings sub-document.
 */
export interface IUserSettings {
    colorblindMode: string;
    textSize: number;
    reducedMotion: boolean;
    musicVolume: number;
    sfxVolume: number;
    locale: string;
    analyticsConsent: boolean;
    inputMethod: string;
}

/**
 * Interface for the PlayerProfile document.
 */
export interface IPlayerProfile extends Document {
    platformId?: string;
    username: string;
    email?: string;
    lastLogin?: Date;
    userSettings: IUserSettings;
    isDeleted: boolean;
}

const UserSettingsSchema = new Schema<IUserSettings>({
    colorblindMode: { type: String, required: true, default: 'none' },
    textSize: { type: Number, required: true, default: 16, min: 8, max: 32 },
    reducedMotion: { type: Boolean, required: true, default: false },
    musicVolume: { type: Number, required: true, default: 1.0, min: 0, max: 1.0 },
    sfxVolume: { type: Number, required: true, default: 1.0, min: 0, max: 1.0 },
    locale: { type: String, required: true, default: 'en' },
    analyticsConsent: { type: Boolean, required: true, default: true },
    inputMethod: { type: String, required: true, default: 'swipe' },
}, { _id: false });

const PlayerProfileSchema = new Schema<IPlayerProfile>({
    platformId: { type: String, index: true, unique: true, sparse: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true }, // Optional, used for custom accounts
    lastLogin: { type: Date },
    userSettings: { type: UserSettingsSchema, required: true, default: () => ({}) },
    isDeleted: { type: Boolean, default: false, index: true },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

export const PlayerProfileModel = model<IPlayerProfile>('PlayerProfile', PlayerProfileSchema);