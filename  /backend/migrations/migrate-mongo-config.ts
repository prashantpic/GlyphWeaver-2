import { config } from 'dotenv';

// Load environment variables from .env file
config();

const migrationConfig = {
  mongodb: {
    // The connection string from environment variables
    url: process.env.MIGRATE_MONGO_URI || 'mongodb://localhost:27017',

    // The database name from environment variables
    databaseName: process.env.MIGRATE_MONGO_DATABASE_NAME || 'glyph-weaver-dev',

    options: {
      useNewUrlParser: true, // Recommended by MongoDB driver
      useUnifiedTopology: true, // Recommended by MongoDB driver
    },
  },

  // The directory where migration scripts are located
  migrationsDir: 'migrations',

  // The name of the collection to store migration history
  changelogCollectionName: 'changelog',

  // The file extension to be used for migration scripts
  migrationFileExtension: '.ts',

  // Enable/disable the use of file hashing
  useFileHash: false,

  // The module system to use
  moduleSystem: 'commonjs',
};

// migrate-mongo requires a CommonJS export
module.exports = migrationConfig;