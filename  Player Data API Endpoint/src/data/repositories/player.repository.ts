import { PlayerProfileModel, IPlayerProfile, IUserSettings } from '../models/playerProfile.model.ts';
import mongoose from 'mongoose';

/**
 * Repository class to encapsulate all database query logic for PlayerProfile documents.
 */
export class PlayerRepository {
    
    /**
     * Finds a player by their MongoDB document ID.
     * @param id - The player's document ID.
     * @returns A promise that resolves to the player document or null if not found.
     */
    public async findById(id: string): Promise<IPlayerProfile | null> {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        return PlayerProfileModel.findById(id).exec();
    }

    /**
     * Updates the settings sub-document for a specific player.
     * @param id - The player's document ID.
     * @param settings - An object containing the settings fields to update.
     * @returns A promise that resolves to the updated player document or null if not found.
     */
    public async updateSettings(id: string, settings: Partial<IUserSettings>): Promise<IPlayerProfile | null> {
        const settingsUpdate: { [key: string]: any } = {};
        for (const key in settings) {
            settingsUpdate[`userSettings.${key}`] = (settings as any)[key];
        }

        return PlayerProfileModel.findByIdAndUpdate(
            id,
            { $set: settingsUpdate },
            { new: true }
        ).exec();
    }
    
    /**
     * Creates a new player profile.
     * @param playerData - The data for the new player.
     * @returns A promise that resolves to the newly created player document.
     */
    public async create(playerData: { username: string, platformId?: string, email?: string }): Promise<IPlayerProfile> {
        const newPlayer = new PlayerProfileModel({
            ...playerData,
            userSettings: {}, // Initialize with default settings
        });
        return newPlayer.save();
    }

    /**
     * Performs a soft delete on a player profile by setting the isDeleted flag.
     * @param id - The player's document ID.
     * @returns A promise that resolves to the updated player document or null if not found.
     */
    public async softDelete(id: string): Promise<IPlayerProfile | null> {
        return PlayerProfileModel.findByIdAndUpdate(
            id,
            { $set: { isDeleted: true, username: `deleted_${id}`, email: undefined, platformId: undefined } }, // Anonymize PII
            { new: true }
        ).exec();
    }
}