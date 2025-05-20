import { Document, Model, FilterQuery, UpdateQuery } from 'mongoose';

export interface IBaseRepository<TDocument extends Document, TModel extends Model<TDocument>> {
    create(data: Partial<TDocument>): Promise<TDocument>;
    findById(id: string): Promise<TDocument | null>;
    findOne(conditions: FilterQuery<TDocument>): Promise<TDocument | null>;
    find(conditions: FilterQuery<TDocument>): Promise<TDocument[]>;
    updateById(id: string, data: UpdateQuery<TDocument>): Promise<TDocument | null>;
    deleteById(id: string): Promise<boolean>;
}