import { Db, MongoClient } from 'mongodb';
import { IPlayerProfile } from '../src/types/collections';

export const up = async (db: Db, client: MongoClient): Promise<void> => {
  // This migration adds the `lastLogin` field to existing PlayerProfile documents.
  // We use an aggregation pipeline in the update to set the `lastLogin` value
  // to the value of the existing `createdAt` field as a sensible default.
  // This operation is idempotent.
  console.log("Updating PlayerProfile documents to add 'lastLogin' field...");

  const result = await db.collection<IPlayerProfile>('PlayerProfile').updateMany(
    { lastLogin: { $exists: false } }, // Filter for documents that do NOT have the lastLogin field
    [{ $set: { lastLogin: '$createdAt' } }] // Use aggregation pipeline to set lastLogin to the value of createdAt
  );

  console.log(`Updated ${result.modifiedCount} documents in PlayerProfile collection.`);
};

export const down = async (db: Db, client: MongoClient): Promise<void> => {
  // This function reverts the migration by removing the `lastLogin` field
  // from all documents in the PlayerProfile collection.
  console.log("Removing 'lastLogin' field from all PlayerProfile documents...");
  
  const result = await db.collection<IPlayerProfile>('PlayerProfile').updateMany(
    { lastLogin: { $exists: true } }, // Filter for documents that have the lastLogin field
    { $unset: { lastLogin: '' } } // Use the $unset operator to remove the field
  );

  console.log(`Updated ${result.modifiedCount} documents in PlayerProfile collection.`);
};