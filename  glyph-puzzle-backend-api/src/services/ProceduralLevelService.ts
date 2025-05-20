import { IProceduralLevelService } from './interfaces/IProceduralLevelService';
import { IProceduralLevelDataRepository } from './interfaces/IProceduralLevelDataRepository';
// import { IProceduralGeneratorClient } from './interfaces/IProceduralGeneratorClient'; // Conceptual: REPO-PROCEDURAL-GEN
import { IAuditLogRepository } from './interfaces/IAuditLogRepository';
// Assuming DTOs are in src/api/procedural-level/dtos
import { LevelSeedRequestDTO, LevelSeedResponseDTO } from '../api/procedural-level/dtos';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

// REQ-CGLE-011, REQ-8-027, REQ-SEC-019, REQ-8-019, REQ-8-016

export class ProceduralLevelService implements IProceduralLevelService {
    constructor(
        private proceduralLevelDataRepository: IProceduralLevelDataRepository,
        private auditLogRepository: IAuditLogRepository,
        // private proceduralGeneratorClient?: IProceduralGeneratorClient // Optional: if server-side generation active
    ) {}

    async requestNewSeed(playerId: string, requestParams: LevelSeedRequestDTO): Promise<LevelSeedResponseDTO> {
        logger.info(`Player ${playerId} requesting new procedural level seed with params: ${JSON.stringify(requestParams)}`);

        let seed: string;
        let levelParameters: any = requestParams.seedParameters || {}; // Default to parameters passed or an empty object
        let levelStructure: any; // Optional structure if generated server-side
        const puzzleType = requestParams.puzzleType || 'default_glyph_puzzle'; // Example default

        // Option 1: Server-side generation (if IProceduralGeneratorClient is available)
        // if (this.proceduralGeneratorClient) {
        //     const generationResult = await this.proceduralGeneratorClient.generateLevel({
        //         difficultyLevel: requestParams.difficultyLevel,
        //         playerProgression: requestParams.playerProgression,
        //         customParameters: requestParams.seedParameters,
        //         puzzleType: puzzleType,
        //     });
        //     seed = generationResult.seed;
        //     levelParameters = generationResult.parameters;
        //     levelStructure = generationResult.structure; // e.g., grid layout, glyph positions
        //     logger.info(`Generated new seed ${seed} for player ${playerId} via server-side generator.`);
        // } else {
        // Option 2: Client-side generation - server provides a seed (e.g., random or from a pool)
        // For simplicity, let's generate a pseudo-random seed here.
        // In a real system, this might involve more sophisticated seed management or selection from pre-generated pool.
        seed = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        logger.info(`Generated new seed ${seed} for player ${playerId} (client-side generation assumed).`);
        // }

        // Store the requested/generated seed information
        await this.proceduralLevelDataRepository.storeSeedRequest({
            playerId,
            seed,
            requestParameters: requestParams,
            generatedParameters: levelParameters,
            // generatedStructure: levelStructure, // if applicable
            timestamp: new Date(),
        });

        await this.auditLogRepository.logEvent({
            eventType: 'PROCEDURAL_SEED_REQUESTED',
            userId: playerId,
            details: { seed, requestParams, levelParameters },
        });

        return {
            seed,
            levelParameters,
            levelStructure, // Will be undefined if not generated server-side with structure
            puzzleType
        };
    }

    async logUsedSeed(playerId: string, logData: LevelSeedRequestDTO): Promise<void> {
        const { seed, outcome, score, duration, playerActions, difficultyLevel, seedParameters } = logData;
        if (!seed) {
            throw new ApiError('Seed is required to log procedural level data.', 400);
        }
        logger.info(`Logging used procedural level seed ${seed} for player ${playerId}, outcome: ${outcome}`);

        await this.proceduralLevelDataRepository.logPlayedLevel({
            playerId,
            seed,
            outcome,
            score,
            duration,
            playerActions,
            difficultyLevel,
            seedParameters, // The parameters the client used for this seed
            timestamp: new Date(),
        });

        await this.auditLogRepository.logEvent({
            eventType: 'PROCEDURAL_SEED_LOGGED',
            userId: playerId,
            details: { seed, outcome, score, duration },
        });
    }
}