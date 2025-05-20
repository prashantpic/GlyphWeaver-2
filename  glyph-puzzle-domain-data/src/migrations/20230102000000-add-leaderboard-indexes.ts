import { Db } from 'mongodb';

const LEADERBOARD_ENTRIES_COLLECTION = 'leaderboardentries';

const LEVEL_LEADERBOARD_INDEX_NAME = 'idx_leaderboard_level_score_ts';
const ZONE_LEADERBOARD_INDEX_NAME = 'idx_leaderboard_zone_score_ts';

export async function up(db: Db /*, client: MongoClient */): Promise<void> {
  // Compound index for level leaderboards
  await db.collection(LEADERBOARD_ENTRIES_COLLECTION).createIndex(
    { levelId: 1, score: -1, timestamp: 1 },
    { name: LEVEL_LEADERBOARD_INDEX_NAME }
  );

  // Compound index for zone leaderboards
  await db.collection(LEADERBOARD_ENTRIES_COLLECTION).createIndex(
    { zoneId: 1, score: -1, timestamp: 1 },
    { name: ZONE_LEADERBOARD_INDEX_NAME }
  );
}

export async function down(db: Db /*, client: MongoClient */): Promise<void> {
  // Drop the compound indexes created in the 'up' function
  try {
    await db.collection(LEADERBOARD_ENTRIES_COLLECTION).dropIndex(LEVEL_LEADERBOARD_INDEX_NAME);
  } catch (error: any) {
    if (error.codeName === 'IndexNotFound') {
      console.warn(`Index ${LEVEL_LEADERBOARD_INDEX_NAME} not found, skipping drop.`);
    } else {
      throw error;
    }
  }

  try {
    await db.collection(LEADERBOARD_ENTRIES_COLLECTION).dropIndex(ZONE_LEADERBOARD_INDEX_NAME);
  } catch (error: any) {
    if (error.codeName === 'IndexNotFound') {
      console.warn(`Index ${ZONE_LEADERBOARD_INDEX_NAME} not found, skipping drop.`);
    } else {
      throw error;
    }
  }
}