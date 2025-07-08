import { Model } from 'mongoose';
import { GameConfiguration } from '../../../../domain/entities/game-configuration.entity';
import { IGameConfigurationRepository } from '../../../../domain/repositories/game-configuration.repository';
import { GameConfigurationDocument } from '../models/game-configuration.model';

/**
 * @file This class provides the concrete implementation for persisting and retrieving GameConfiguration aggregates using Mongoose and MongoDB.
 * @namespace GlyphWeaver.Backend.System.Infrastructure.Database.Mongoose.Repositories
 */

/**
 * @class MongoGameConfigurationRepository
 * @description Implements the IGameConfigurationRepository interface using Mongoose for MongoDB.
 * @implements {IGameConfigurationRepository}
 * @pattern RepositoryPattern, DependencyInjection
 */
export class MongoGameConfigurationRepository implements IGameConfigurationRepository {

  constructor(private readonly gameConfigModel: Model<GameConfigurationDocument>) {}

  /**
   * Maps a Mongoose document to a domain entity.
   * @param doc The Mongoose document.
   * @returns The GameConfiguration domain entity.
   */
  private toDomain(doc: GameConfigurationDocument): GameConfiguration {
    return new GameConfiguration({
      _id: doc._id.toString(),
      key: doc.key,
      value: doc.value,
      version: doc.version,
      description: doc.description ?? '',
      updatedAt: doc.updatedAt,
      lastUpdatedBy: doc.lastUpdatedBy,
    });
  }

  /**
   * @inheritdoc
   */
  async findByKey(key: string): Promise<GameConfiguration | null> {
    const doc = await this.gameConfigModel.findOne({ key }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  /**
   * @inheritdoc
   */
  async findAll(): Promise<GameConfiguration[]> {
    const docs = await this.gameConfigModel.find().exec();
    return docs.map(this.toDomain);
  }

  /**
   * @inheritdoc
   */
  async save(config: GameConfiguration): Promise<void> {
    // Optimistic concurrency control: ensure the version matches before updating.
    const query = { key: config.key, version: config.version - 1 };
    
    const updateData = {
      key: config.key,
      value: config.getValue(),
      version: config.version,
      description: config.description,
      lastUpdatedBy: config.lastUpdatedBy,
      updatedAt: config.updatedAt,
    };
    
    // findOneAndUpdate with upsert:true creates the document if it doesn't exist.
    // However, the initial save should be handled separately for clarity or rely on
    // version starting at 1. An update from v0 to v1.
    // If the config is new (version 1), the query becomes {key, version: 0}
    const isNew = config.version === 1;
    const findQuery = isNew ? { key: config.key } : { key: config.key, version: config.version - 1 };

    const result = await this.gameConfigModel.findOneAndUpdate(
      findQuery, 
      { $set: updateData },
      { new: true, upsert: isNew }
    ).exec();

    if (!result) {
        // This will happen if the document was updated by another process
        // between the read and write operations (optimistic lock failed).
        throw new Error(`Failed to save configuration for key '${config.key}'. Version mismatch or document not found.`);
    }
  }
}