import { Document, Model, FilterQuery, UpdateQuery, QueryOptions } from 'mongoose';
import { IBaseRepository } from '../interfaces/IBaseRepository'; // Assuming IBaseRepository.ts exists as per SDS

export class BaseRepository<TDocument extends Document, TModel extends Model<TDocument>>
  implements IBaseRepository<TDocument, TModel>
{
  protected model: TModel;

  protected constructor(model: TModel) {
    this.model = model;
  }

  async create(data: Partial<TDocument>): Promise<TDocument> {
    // Mongoose's create method expects an object that matches the schema,
    // not necessarily Partial<TDocument> if TDocument includes methods or virtuals.
    // However, for simple data objects, this often works.
    // A more type-safe way might involve using Mongoose's `Require_id = false` types for creation.
    return this.model.create(data as any); // Using 'as any' for broader compatibility with input types
  }

  async findById(id: string): Promise<TDocument | null> {
    return this.model.findById(id).exec();
  }

  async findOne(conditions: FilterQuery<TDocument>): Promise<TDocument | null> {
    return this.model.findOne(conditions).exec();
  }

  async find(conditions: FilterQuery<TDocument>, options?: QueryOptions): Promise<TDocument[]> {
    return this.model.find(conditions, null, options).exec();
  }

  async updateById(id: string, data: UpdateQuery<TDocument>): Promise<TDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndDelete(id).exec();
    return !!result;
  }

  async count(conditions: FilterQuery<TDocument>): Promise<number> {
    return this.model.countDocuments(conditions).exec();
  }
}