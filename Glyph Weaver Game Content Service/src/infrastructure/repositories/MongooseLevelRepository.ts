import { ILevelRepository } from '@/domain/interfaces/ILevelRepository';
import Level, { ILevel } from '@/domain/models/Level.model';

/**
 * @class MongooseLevelRepository
 * @implements {ILevelRepository}
 * @description Concrete implementation of the ILevelRepository using Mongoose for MongoDB interaction.
 */
export class MongooseLevelRepository implements ILevelRepository {

    /**
     * @inheritdoc
     */
    public async findById(id: string): Promise<ILevel | null> {
        // Populating references to get full Zone, Glyph, etc. data could be added here if needed
        // e.g., .populate('zoneId').populate('glyphs.glyphId')
        return await Level.findById(id).exec();
    }

    /**
     * @inheritdoc
     */
    public async findByZoneId(zoneId: string): Promise<ILevel[]> {
        return await Level.find({ zoneId })
                          .sort({ levelNumber: 'asc' }) // Ensure levels are ordered correctly
                          .exec();
    }

    /**
     * @inheritdoc
     */
    public async findAllTemplates(): Promise<ILevel[]> {
        return await Level.find({ type: 'procedural_template' })
                          .sort({ zoneId: 'asc', levelNumber: 'asc' })
                          .exec();
    }
}