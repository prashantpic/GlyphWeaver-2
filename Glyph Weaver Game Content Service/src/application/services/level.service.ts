import { ILevelRepository } from '@/domain/interfaces/ILevelRepository';
import { LevelDetailDto, LevelSummaryDto } from '../dtos/level.dto';
import { ILevel } from '@/domain/models/Level.model';

/**
 * @class LevelService
 * @description Orchestrates business logic for level-related operations.
 * It acts as an intermediary between the presentation layer (controllers) and the data access layer (repositories).
 */
export class LevelService {
    private readonly levelRepository: ILevelRepository;

    /**
     * Initializes a new instance of the LevelService class.
     * @param levelRepository An implementation of ILevelRepository for data access.
     */
    constructor(levelRepository: ILevelRepository) {
        this.levelRepository = levelRepository;
    }

    /**
     * Retrieves the full details for a single level by its ID.
     * @param id The unique identifier for the level.
     * @returns A promise that resolves to a LevelDetailDto or null if not found.
     */
    public async getLevelDetails(id: string): Promise<LevelDetailDto | null> {
        const level = await this.levelRepository.findById(id);
        if (!level) {
            return null;
        }
        return this.mapToLevelDetailDto(level);
    }

    /**
     * Retrieves a summary list of all levels within a specific zone.
     * @param zoneId The unique identifier for the zone.
     * @returns A promise that resolves to an array of LevelSummaryDto.
     */
    public async getLevelsForZone(zoneId: string): Promise<LevelSummaryDto[]> {
        const levels = await this.levelRepository.findByZoneId(zoneId);
        return levels.map(this.mapToLevelSummaryDto);
    }

    /**
     * Maps an ILevel domain model to a LevelSummaryDto.
     * @param level The ILevel document.
     * @returns A LevelSummaryDto object.
     */
    private mapToLevelSummaryDto(level: ILevel): LevelSummaryDto {
        return {
            id: level._id.toString(),
            levelNumber: level.levelNumber,
            type: level.type,
        };
    }

    /**
     * Maps an ILevel domain model to a LevelDetailDto, ensuring no sensitive data is exposed.
     * @param level The ILevel document.
     * @returns A LevelDetailDto object.
     */
    private mapToLevelDetailDto(level: ILevel): LevelDetailDto {
        return {
            id: level._id.toString(),
            zoneId: level.zoneId.toString(),
            levelNumber: level.levelNumber,
            type: level.type,
            gridSize: level.gridSize,
            timeLimit: level.timeLimit,
            moveLimit: level.moveLimit,
            glyphs: level.glyphs.map(g => ({
                glyphId: g.glyphId.toString(),
                position: g.position,
                properties: g.properties,
            })),
            obstacles: level.obstacles.map(o => ({
                obstacleId: o.obstacleId.toString(),
                position: o.position,
            })),
            puzzleTypes: level.puzzleTypes.map(pt => pt.toString()),
        };
    }
}