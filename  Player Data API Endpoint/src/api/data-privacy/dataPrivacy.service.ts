import { PlayerRepository } from '../../data/repositories/player.repository.ts';
import { LevelProgressModel } from '../../data/models/levelProgress.model.ts';
import { PlayerInventoryModel } from '../../data/models/playerInventory.model.ts';
import { AuditService } from '../../services/audit.service.ts';
import { ApiError } from '../../core/errors/ApiError.ts';
import { Types } from 'mongoose';

/**
 * Encapsulates the logic for processing data subject rights requests under
 * GDPR and CCPA, ensuring all related data is gathered or deleted correctly.
 */
export class DataPrivacyService {
    
    // Using repositories for abstraction where available
    private playerRepository: PlayerRepository;

    constructor(private auditService: AuditService) {
        this.playerRepository = new PlayerRepository();
    }

    /**
     * Gathers all personal data for a user for an export request.
     * @param playerId - The ID of the authenticated player.
     * @param ipAddress - The requestor's IP address for auditing.
     * @returns An object containing all of the user's data.
     */
    public async requestDataExport(playerId: string, ipAddress?: string) {
        const playerObjectId = new Types.ObjectId(playerId);

        const profile = await this.playerRepository.findById(playerId);
        if (!profile || profile.isDeleted) {
            throw new ApiError(404, 'Player profile not found.');
        }

        const [progress, inventory] = await Promise.all([
            LevelProgressModel.find({ userId: playerObjectId }).lean(),
            PlayerInventoryModel.find({ userId: playerObjectId }).lean(),
            // In a real system, you'd also fetch IAP history, etc.
        ]);
        
        await this.auditService.logDataPrivacyAction(playerId, 'DATA_ACCESS_REQUEST', { status: 'success' }, ipAddress);

        const exportData = {
            profile,
            progress,
            inventory,
            iapHistory: [] // Placeholder for IAP service data
        };

        return {
            message: "Data export request received. The data will be sent to your registered email address.",
            exportData
        };
    }

    /**
     * Initiates the deletion of a user's personal data.
     * This performs a soft delete and anonymizes the PlayerProfile.
     * @param playerId - The ID of the authenticated player.
     * @param ipAddress - The requestor's IP address for auditing.
     * @returns An object containing a confirmation message.
     */
    public async requestDataDeletion(playerId: string, ipAddress?: string) {
        const deletedProfile = await this.playerRepository.softDelete(playerId);
        
        if (!deletedProfile) {
            throw new ApiError(404, 'Player profile not found.');
        }

        // Hard delete associated non-essential data
        await Promise.all([
            LevelProgressModel.deleteMany({ userId: new Types.ObjectId(playerId) }),
            PlayerInventoryModel.deleteMany({ userId: new Types.ObjectId(playerId) }),
        ]);

        await this.auditService.logDataPrivacyAction(playerId, 'DATA_DELETION_REQUEST', { status: 'initiated' }, ipAddress);

        return {
            message: "Your data deletion request has been received and is being processed. This action is irreversible.",
            scheduledAt: new Date().toISOString()
        };
    }
}