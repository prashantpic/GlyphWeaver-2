import { Db } from 'mongodb';

// Collection names should match Mongoose model names (pluralized by default)
const PLAYER_PROFILES_COLLECTION = 'playerprofiles';
const LEADERBOARD_ENTRIES_COLLECTION = 'leaderboardentries';
const PROCEDURAL_LEVEL_DATA_COLLECTION = 'proceduralleveldatas';
const IAP_TRANSACTIONS_COLLECTION = 'iaptransactions';
const AUDIT_LOGS_COLLECTION = 'auditlogs';
const GAME_CONFIGURATIONS_COLLECTION = 'gameconfigurations';

export async function up(db: Db /*, client: MongoClient */): Promise<void> {
  // Mongoose typically handles collection creation automatically upon first write
  // or when ensureIndexes is called (implicitly or explicitly).
  // This migration focuses on creating essential indexes.

  // PlayerProfiles indexes
  await db.collection(PLAYER_PROFILES_COLLECTION).createIndex({ userId: 1 }, { unique: true, name: 'idx_playerprofiles_userId' });
  await db.collection(PLAYER_PROFILES_COLLECTION).createIndex({ platformUserId: 1 }, { sparse: true, name: 'idx_playerprofiles_platformUserId' });
  await db.collection(PLAYER_PROFILES_COLLECTION).createIndex({ email: 1 }, { unique: true, sparse: true, name: 'idx_playerprofiles_email' });

  // LeaderboardEntries basic index (more specific ones in another migration)
  await db.collection(LEADERBOARD_ENTRIES_COLLECTION).createIndex({ timestamp: 1 }, { name: 'idx_leaderboardentries_timestamp' });
  // playerId is also important, though specific query indexes are separate
  await db.collection(LEADERBOARD_ENTRIES_COLLECTION).createIndex({ playerId: 1 }, { name: 'idx_leaderboardentries_playerId' });


  // ProceduralLevelDatas indexes
  await db.collection(PROCEDURAL_LEVEL_DATA_COLLECTION).createIndex({ levelId: 1 }, { unique: true, name: 'idx_proceduralleveldatas_levelId' });
  await db.collection(PROCEDURAL_LEVEL_DATA_COLLECTION).createIndex({ seed: 1 }, { name: 'idx_proceduralleveldatas_seed' });

  // IAPTransactions indexes
  await db.collection(IAP_TRANSACTIONS_COLLECTION).createIndex({ transactionId: 1 }, { unique: true, name: 'idx_iaptransactions_transactionId' });
  await db.collection(IAP_TRANSACTIONS_COLLECTION).createIndex({ userId: 1 }, { name: 'idx_iaptransactions_userId' });
  await db.collection(IAP_TRANSACTIONS_COLLECTION).createIndex({ validationStatus: 1, processed: 1 }, { name: 'idx_iaptransactions_status_processed' });


  // AuditLogs indexes
  await db.collection(AUDIT_LOGS_COLLECTION).createIndex({ timestamp: 1 }, { name: 'idx_auditlogs_timestamp' });
  await db.collection(AUDIT_LOGS_COLLECTION).createIndex({ eventCategory: 1 }, { name: 'idx_auditlogs_eventCategory' });
  await db.collection(AUDIT_LOGS_COLLECTION).createIndex({ actorId: 1 }, { sparse: true, name: 'idx_auditlogs_actorId' });
  await db.collection(AUDIT_LOGS_COLLECTION).createIndex({ targetId: 1 }, { sparse: true, name: 'idx_auditlogs_targetId' });

  // GameConfigurations index
  await db.collection(GAME_CONFIGURATIONS_COLLECTION).createIndex({ configKey: 1 }, { unique: true, name: 'idx_gameconfigurations_configKey' });
  await db.collection(GAME_CONFIGURATIONS_COLLECTION).createIndex({ isActive: 1 }, { name: 'idx_gameconfigurations_isActive' });
}

export async function down(db: Db /*, client: MongoClient */): Promise<void> {
  // Drop indexes created in the 'up' function
  await db.collection(PLAYER_PROFILES_COLLECTION).dropIndex('idx_playerprofiles_userId').catch(handleDropError);
  await db.collection(PLAYER_PROFILES_COLLECTION).dropIndex('idx_playerprofiles_platformUserId').catch(handleDropError);
  await db.collection(PLAYER_PROFILES_COLLECTION).dropIndex('idx_playerprofiles_email').catch(handleDropError);

  await db.collection(LEADERBOARD_ENTRIES_COLLECTION).dropIndex('idx_leaderboardentries_timestamp').catch(handleDropError);
  await db.collection(LEADERBOARD_ENTRIES_COLLECTION).dropIndex('idx_leaderboardentries_playerId').catch(handleDropError);

  await db.collection(PROCEDURAL_LEVEL_DATA_COLLECTION).dropIndex('idx_proceduralleveldatas_levelId').catch(handleDropError);
  await db.collection(PROCEDURAL_LEVEL_DATA_COLLECTION).dropIndex('idx_proceduralleveldatas_seed').catch(handleDropError);

  await db.collection(IAP_TRANSACTIONS_COLLECTION).dropIndex('idx_iaptransactions_transactionId').catch(handleDropError);
  await db.collection(IAP_TRANSACTIONS_COLLECTION).dropIndex('idx_iaptransactions_userId').catch(handleDropError);
  await db.collection(IAP_TRANSACTIONS_COLLECTION).dropIndex('idx_iaptransactions_status_processed').catch(handleDropError);

  await db.collection(AUDIT_LOGS_COLLECTION).dropIndex('idx_auditlogs_timestamp').catch(handleDropError);
  await db.collection(AUDIT_LOGS_COLLECTION).dropIndex('idx_auditlogs_eventCategory').catch(handleDropError);
  await db.collection(AUDIT_LOGS_COLLECTION).dropIndex('idx_auditlogs_actorId').catch(handleDropError);
  await db.collection(AUDIT_LOGS_COLLECTION).dropIndex('idx_auditlogs_targetId').catch(handleDropError);

  await db.collection(GAME_CONFIGURATIONS_COLLECTION).dropIndex('idx_gameconfigurations_configKey').catch(handleDropError);
  await db.collection(GAME_CONFIGURATIONS_COLLECTION).dropIndex('idx_gameconfigurations_isActive').catch(handleDropError);

  // Optionally, drop collections if this is truly a 'destructive' down migration
  // Be very careful with this in production environments.
  // await db.collection(PLAYER_PROFILES_COLLECTION).drop().catch(handleDropError);
  // await db.collection(LEADERBOARD_ENTRIES_COLLECTION).drop().catch(handleDropError);
  // ... and so on for other collections
}

// Helper to catch errors if index/collection doesn't exist (MongoDB error code 27 for 'NamespaceNotFound')
// or other potential drop errors, preventing migration failure.
function handleDropError(error: any) {
  if (error.code === 27 || error.message.includes('ns not found')) {
    console.warn(`Attempted to drop non-existent namespace/index: ${error.message}`);
  } else {
    console.error(`Error dropping index/collection: ${error.message}`);
    // Rethrow if it's not a "not found" error, to make migration fail
    throw error;
  }
}