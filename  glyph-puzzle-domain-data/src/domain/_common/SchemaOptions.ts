import { SchemaOptions } from 'mongoose';

export const defaultSchemaOptions: SchemaOptions = {
    timestamps: true,
    versionKey: 'schemaVersion',
};