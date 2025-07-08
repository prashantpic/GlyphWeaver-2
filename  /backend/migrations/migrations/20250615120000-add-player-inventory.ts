import { Db, MongoClient } from 'mongodb';

export const up = async (db: Db, client: MongoClient): Promise<void> => {
  // Although the initial schema might create this, this migration ensures it exists
  // and has the correct indexes, serving as an authoritative setup for this feature.
  // We drop it first to ensure a clean slate for this migration's logic.
  try {
    await db.collection('PlayerInventory').drop();
    console.log('Dropped existing PlayerInventory collection to ensure clean setup.');
  } catch (err: any) {
    // Ignore error if collection doesn't exist (code 26)
    if (err.code !== 26) {
      console.error('Error dropping PlayerInventory, proceeding anyway:', err);
    }
  }

  // Create the PlayerInventory collection
  await db.createCollection('PlayerInventory');
  console.log('Created PlayerInventory collection.');

  // Create the unique compound index to ensure data integrity
  await db.collection('PlayerInventory').createIndex(
    { userId: 1, type: 1, keyName: 1 },
    { unique: true, name: 'uq_playerinventory_userid_type_keyname' }
  );
  console.log('Created unique index on PlayerInventory (userId, type, keyName).');

  // Create the query index on userId for efficient lookups
  await db.collection('PlayerInventory').createIndex(
    { userId: 1 },
    { name: 'idx_playerinventory_userid' }
  );
  console.log('Created query index on PlayerInventory (userId).');
};

export const down = async (db: Db, client: MongoClient): Promise<void> => {
  // Drop the PlayerInventory collection
  await db.collection('PlayerInventory').drop();
  console.log('Dropped PlayerInventory collection.');
};