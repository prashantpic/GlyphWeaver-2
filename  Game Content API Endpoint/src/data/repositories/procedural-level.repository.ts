import { Model } from 'mongoose';
import ProceduralLevel, { IProceduralLevel } from '../models/procedural-level.model';

/**
 * Repository for handling all database operations for the 'procedurallevels' collection.
 * It abstracts the Mongoose-specific calls from the application/service layer.
 */
export class ProceduralLevelRepository {
  /**
   * @param proceduralLevelModel The Mongoose model for ProceduralLevel, injected for testability.
   */
  constructor(private readonly proceduralLevelModel: Model<IProceduralLevel>) {}

  /**
   * Creates and saves a new procedural level document in the database.
   * @param levelData An object containing the data for the new level.
   * @returns A promise that resolves to the newly created level document.
   */
  public async create(levelData: Partial<IProceduralLevel>): Promise<IProceduralLevel> {
    const newLevel = new this.proceduralLevelModel(levelData);
    return newLevel.save();
  }

  /**
   * Finds a procedural level document by its unique ID.
   * @param id The string representation of the document's ObjectId.
   * @returns A promise that resolves to the found document or null if not found.
   */
  public async findById(id: string): Promise<IProceduralLevel | null> {
    return this.proceduralLevelModel.findById(id).exec();
  }
}

// Export a default instance with the actual model for convenience.
export default new ProceduralLevelRepository(ProceduralLevel);