import { Db, MongoClient } from 'mongodb';

export const up = async (db: Db, client: MongoClient): Promise<void> => {
  // Collection Creation
  await db.createCollection('Zone');
  await db.createCollection('Level');
  await db.createCollection('ProceduralLevel');
  await db.createCollection('PuzzleType');
  await db.createCollection('Obstacle');
  await db.createCollection('Glyph');
  await db.createCollection('Tutorial');
  await db.createCollection('PlayerProfile');
  await db.createCollection('UserTutorialStatus');
  await db.createCollection('LevelProgress');
  await db.createCollection('InAppPurchase');
  await db.createCollection('IAPTransaction');
  await db.createCollection('PlayerInventory');
  await db.createCollection('Leaderboard');
  await db.createCollection('PlayerScore');
  await db.createCollection('Achievement');
  await db.createCollection('PlayerAchievement');
  await db.createCollection('CloudSave');
  await db.createCollection('GameConfiguration');
  await db.createCollection('AuditLog');

  // Index Creation
  console.log('Creating indexes for all collections...');

  // Zone
  await db.collection('Zone').createIndex({ name: 1 }, { name: 'idx_zone_name' });

  // Level
  await db.collection('Level').createIndex({ zoneId: 1, levelNumber: 1 }, { name: 'idx_level_zoneid_levelnumber' });
  await db.collection('Level').createIndex({ type: 1 }, { name: 'idx_level_type' });

  // ProceduralLevel
  await db.collection('ProceduralLevel').createIndex({ baseLevelId: 1, generatedAt: -1 }, { name: 'idx_procedurallevel_baselevelid_generatedat' });
  await db.collection('ProceduralLevel').createIndex({ zoneId: 1, levelNumber: 1 }, { name: 'idx_procedurallevel_zoneid_levelnumber' });

  // PuzzleType
  await db.collection('PuzzleType').createIndex({ name: 1 }, { unique: true, name: 'uq_puzzletype_name' });
  
  // Obstacle
  await db.collection('Obstacle').createIndex({ name: 1 }, { unique: true, name: 'uq_obstacle_name' });

  // Glyph
  await db.collection('Glyph').createIndex({ type: 1 }, { name: 'idx_glyph_type' });

  // Tutorial
  await db.collection('Tutorial').createIndex({ keyName: 1 }, { unique: true, name: 'uq_tutorial_keyname' });
  await db.collection('Tutorial').createIndex({ order: 1 }, { name: 'idx_tutorial_order' });

  // PlayerProfile
  await db.collection('PlayerProfile').createIndex({ username: 1 }, { unique: true, name: 'uq_playerprofile_username' });
  await db.collection('PlayerProfile').createIndex({ platformId: 1 }, { sparse: true, name: 'idx_playerprofile_platformid' });
  await db.collection('PlayerProfile').createIndex({ isDeleted: 1 }, { name: 'idx_playerprofile_isdeleted' });
  await db.collection('PlayerProfile').createIndex({ currentZone: 1 }, { sparse: true, name: 'idx_playerprofile_currentzone' });

  // UserTutorialStatus
  await db.collection('UserTutorialStatus').createIndex({ userId: 1, tutorialId: 1 }, { unique: true, name: 'uq_usertutorialstatus_userid_tutorialid' });

  // LevelProgress
  await db.collection('LevelProgress').createIndex({ userId: 1, levelId: 1, isProcedural: 1 }, { unique: true, name: 'uq_levelprogress_userid_levelid_isprocedural' });
  await db.collection('LevelProgress').createIndex({ levelId: 1, isProcedural: 1 }, { name: 'idx_levelprogress_levelid_isprocedural' });
  
  // InAppPurchase
  await db.collection('InAppPurchase').createIndex({ sku: 1 }, { unique: true, name: 'uq_inapppurchase_sku' });

  // IAPTransaction
  await db.collection('IAPTransaction').createIndex({ platform: 1, platformTransactionId: 1 }, { unique: true, name: 'uq_iaptransaction_platform_transactionid' });
  await db.collection('IAPTransaction').createIndex({ userId: 1 }, { name: 'idx_iaptransaction_userid' });
  await db.collection('IAPTransaction').createIndex({ validationStatus: 1 }, { name: 'idx_iaptransaction_validationstatus' });

  // PlayerInventory - Note: This collection is officially created in a later migration, but adding here avoids errors if run out of order. We'll drop and recreate it there.
  try { await db.collection('PlayerInventory').drop(); } catch (e) { /* ignore */ }
  await db.createCollection('PlayerInventory');
  await db.collection('PlayerInventory').createIndex({ userId: 1, type: 1, keyName: 1 }, { unique: true, name: 'uq_playerinventory_userid_type_keyname' });
  await db.collection('PlayerInventory').createIndex({ userId: 1 }, { name: 'idx_playerinventory_userid' });
  await db.collection('PlayerInventory').createIndex({ type: 1, keyName: 1 }, { name: 'idx_playerinventory_type_keyname' });

  // Leaderboard
  await db.collection('Leaderboard').createIndex({ keyName: 1 }, { unique: true, name: 'uq_leaderboard_keyname' });

  // PlayerScore
  await db.collection('PlayerScore').createIndex({ leaderboardId: 1, scoreValue: -1, timestamp: 1 }, { name: 'idx_playerscore_leaderboardid_scorevalue_timestamp' });
  await db.collection('PlayerScore').createIndex({ userId: 1, leaderboardId: 1 }, { name: 'idx_playerscore_userid_leaderboardid' });
  await db.collection('PlayerScore').createIndex({ timestamp: 1 }, { name: 'idx_playerscore_timestamp' });
  await db.collection('PlayerScore').createIndex({ isValid: 1 }, { name: 'idx_playerscore_isvalid' });

  // Achievement
  await db.collection('Achievement').createIndex({ keyName: 1 }, { unique: true, name: 'uq_achievement_keyname' });
  await db.collection('Achievement').createIndex({ platformId: 1 }, { sparse: true, name: 'idx_achievement_platformid' });

  // PlayerAchievement
  await db.collection('PlayerAchievement').createIndex({ userId: 1, achievementId: 1 }, { unique: true, name: 'uq_playerachievement_userid_achievementid' });
  await db.collection('PlayerAchievement').createIndex({ unlockedAt: 1 }, { sparse: true, name: 'idx_playerachievement_unlockedat' });
  
  // CloudSave
  await db.collection('CloudSave').createIndex({ userId: 1, platform: 1 }, { unique: true, name: 'uq_cloudsave_userid_platform' });
  await db.collection('CloudSave').createIndex({ lastSynced: -1 }, { name: 'idx_cloudsave_lastsynced' });

  // GameConfiguration
  await db.collection('GameConfiguration').createIndex({ key: 1 }, { unique: true, name: 'uq_gameconfiguration_key' });

  // AuditLog
  await db.collection('AuditLog').createIndex({ timestamp: -1, eventType: 1 }, { name: 'idx_auditlog_timestamp_eventtype' });
  await db.collection('AuditLog').createIndex({ userId: 1, timestamp: -1 }, { name: 'idx_auditlog_userid_timestamp' });

  console.log('Index creation complete.');
};

export const down = async (db: Db, client: MongoClient): Promise<void> => {
  const collections = [
    'Zone', 'Level', 'ProceduralLevel', 'PuzzleType', 'Obstacle', 'Glyph',
    'Tutorial', 'PlayerProfile', 'UserTutorialStatus', 'LevelProgress',
    'InAppPurchase', 'IAPTransaction', 'PlayerInventory', 'Leaderboard',
    'PlayerScore', 'Achievement', 'PlayerAchievement', 'CloudSave',
    'GameConfiguration', 'AuditLog'
  ];

  for (const collection of collections) {
    try {
      await db.collection(collection).drop();
      console.log(`Dropped collection: ${collection}`);
    } catch (err: any) {
      // Ignore error if collection doesn't exist (code 26)
      if (err.code !== 26) {
        console.error(`Error dropping collection ${collection}:`, err);
        throw err;
      }
    }
  }
};