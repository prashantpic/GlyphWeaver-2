# Specification

# 1. Files

- **Path:** backend/migrations/package.json  
**Description:** Defines the Node.js project, its dependencies (like migrate-mongo, typescript), and scripts for running migrations.  
**Template:** Node.js Package Manifest  
**Dependency Level:** 0  
**Name:** package  
**Type:** Configuration  
**Relative Path:** package.json  
**Repository Id:** REPO-GLYPH-DB-MIGRATIONS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Dependency Management
    - Migration Script Execution
    
**Requirement Ids:**
    
    - REQ-8-009
    
**Purpose:** Manages project dependencies and provides CLI scripts for creating and applying database migrations.  
**Logic Description:** Contains a 'dependencies' section for 'migrate-mongo' and 'mongodb'. Includes a 'devDependencies' section for 'typescript', '@types/node', and 'ts-node'. The 'scripts' section defines commands like 'migrate:create', 'migrate:up', and 'migrate:down' to execute the migration tool.  
**Documentation:**
    
    - **Summary:** Standard npm package file. It lists the project's dependencies and defines scripts that wrap the 'migrate-mongo' command-line tool for ease of use within the CI/CD pipeline.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/migrations/tsconfig.json  
**Description:** TypeScript compiler configuration for the database migration scripts.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** tsconfig  
**Type:** Configuration  
**Relative Path:** tsconfig.json  
**Repository Id:** REPO-GLYPH-DB-MIGRATIONS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - TypeScript Compilation
    
**Requirement Ids:**
    
    
**Purpose:** Configures how TypeScript files (.ts) are compiled into JavaScript for execution by Node.js.  
**Logic Description:** Specifies compiler options such as 'target' (e.g., 'ES2020'), 'module' ('commonjs'), 'esModuleInterop', 'strict', and 'outDir' to place compiled files in a 'dist' directory. Includes the 'src' and 'migrations' directories in the compilation scope.  
**Documentation:**
    
    - **Summary:** This file provides the necessary settings for the TypeScript compiler to correctly transpile migration scripts into a format that the 'migrate-mongo' tool can execute.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/migrations/migrate-mongo-config.ts  
**Description:** Configuration file for the migrate-mongo tool. Specifies database connection details and migration script locations.  
**Template:** TypeScript Configuration  
**Dependency Level:** 0  
**Name:** migrate-mongo-config  
**Type:** Configuration  
**Relative Path:** migrate-mongo-config.ts  
**Repository Id:** REPO-GLYPH-DB-MIGRATIONS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Migration Tool Configuration
    
**Requirement Ids:**
    
    - REQ-8-009
    
**Purpose:** Provides the migrate-mongo library with the necessary configuration to connect to the MongoDB database and manage migration state.  
**Logic Description:** The file exports a configuration object. This object reads database connection details (URL, database name) from environment variables to support different environments (local, staging, production). It specifies the path to the migrations directory and the name of the collection to store migration history ('changelogCollectionName').  
**Documentation:**
    
    - **Summary:** Configures the 'migrate-mongo' tool. It is crucial for pointing the tool to the correct database instance and telling it where to find migration scripts and where to log its own progress.
    
**Namespace:**   
**Metadata:**
    
    - **Category:** Configuration
    
- **Path:** backend/migrations/migrations/20250520100000-initial-schema-setup.ts  
**Description:** The first migration script that establishes the baseline database schema, creating all initial collections and their required indexes as defined in the database design.  
**Template:** TypeScript Migration Script  
**Dependency Level:** 1  
**Name:** 20250520100000-initial-schema-setup  
**Type:** MigrationScript  
**Relative Path:** migrations/20250520100000-initial-schema-setup.ts  
**Repository Id:** REPO-GLYPH-DB-MIGRATIONS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** up  
**Parameters:**
    
    - db: Db
    
**Return Type:** Promise<void>  
**Attributes:** export const  
    - **Name:** down  
**Parameters:**
    
    - db: Db
    
**Return Type:** Promise<void>  
**Attributes:** export const  
    
**Implemented Features:**
    
    - Initial Database Schema Creation
    
**Requirement Ids:**
    
    - REQ-8-004
    - REQ-8-009
    - REQ-SCF-012
    
**Purpose:** To create the initial set of MongoDB collections and indexes, ensuring the database is correctly structured for the application's first launch.  
**Logic Description:** The 'up' function will sequentially create each collection (PlayerProfile, Level, LevelProgress, Leaderboard, PlayerScore, etc.) using `db.createCollection()`. After creating each collection, it will use `db.collection('collectionName').createIndex()` to create all specified simple, compound, and unique indexes from the database design document. The 'down' function will perform the reverse operation, dropping each collection created in the 'up' function to allow for a clean rollback.  
**Documentation:**
    
    - **Summary:** This is the foundational migration. It takes an empty database and builds the entire required structure, including collections and performance-critical indexes, to support all application features at launch.
    
**Namespace:** GlyphWeaver.Backend.Migrations  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/migrations/migrations/20250615120000-add-player-inventory.ts  
**Description:** Migration script to create the PlayerInventory collection and its associated indexes, likely part of an early feature update.  
**Template:** TypeScript Migration Script  
**Dependency Level:** 2  
**Name:** 20250615120000-add-player-inventory  
**Type:** MigrationScript  
**Relative Path:** migrations/20250615120000-add-player-inventory.ts  
**Repository Id:** REPO-GLYPH-DB-MIGRATIONS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** up  
**Parameters:**
    
    - db: Db
    
**Return Type:** Promise<void>  
**Attributes:** export const  
    - **Name:** down  
**Parameters:**
    
    - db: Db
    
**Return Type:** Promise<void>  
**Attributes:** export const  
    
**Implemented Features:**
    
    - Player Inventory Feature Support
    
**Requirement Ids:**
    
    - REQ-8-004
    
**Purpose:** Introduces the PlayerInventory collection to track consumable and permanent items owned by players.  
**Logic Description:** The 'up' function will create the 'PlayerInventory' collection. It will then create the required compound unique index on `userId`, `type`, and `keyName` to ensure data integrity. It will also create a simple index on `userId` for efficient querying. The 'down' function will drop the 'PlayerInventory' collection.  
**Documentation:**
    
    - **Summary:** This migration adds the necessary database table to support the player inventory system, which manages items like hints, undos, and cosmetics.
    
**Namespace:** GlyphWeaver.Backend.Migrations  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/migrations/migrations/20250701093000-add-last-login-to-player-profile.ts  
**Description:** A migration script that modifies the PlayerProfile collection to add a new 'lastLogin' field.  
**Template:** TypeScript Migration Script  
**Dependency Level:** 2  
**Name:** 20250701093000-add-last-login-to-player-profile  
**Type:** MigrationScript  
**Relative Path:** migrations/20250701093000-add-last-login-to-player-profile.ts  
**Repository Id:** REPO-GLYPH-DB-MIGRATIONS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    - **Name:** up  
**Parameters:**
    
    - db: Db
    
**Return Type:** Promise<void>  
**Attributes:** export const  
    - **Name:** down  
**Parameters:**
    
    - db: Db
    
**Return Type:** Promise<void>  
**Attributes:** export const  
    
**Implemented Features:**
    
    - Player Activity Tracking
    
**Requirement Ids:**
    
    - REQ-AMOT-003
    
**Purpose:** To enhance the PlayerProfile schema with a timestamp for the last login event, enabling features like daily rewards or cohort analysis based on activity.  
**Logic Description:** The 'up' function will use `db.collection('PlayerProfile').updateMany()` with a filter `{ lastLogin: { $exists: false } }` to add the `lastLogin` field to all existing documents, potentially setting it to the user's `createdAt` date as a default. The 'down' function will use `updateMany()` with the `$unset` operator to remove the `lastLogin` field from all documents in the collection.  
**Documentation:**
    
    - **Summary:** This migration evolves the PlayerProfile data model to include tracking of the last login time, which is essential for user engagement and retention analysis.
    
**Namespace:** GlyphWeaver.Backend.Migrations  
**Metadata:**
    
    - **Category:** DataAccess
    
- **Path:** backend/migrations/src/types/collections.ts  
**Description:** Contains TypeScript interfaces that define the shape of the MongoDB documents. These types are used within migration scripts for type safety and IntelliSense.  
**Template:** TypeScript Definition  
**Dependency Level:** 0  
**Name:** collections  
**Type:** TypeDefinition  
**Relative Path:** src/types/collections.ts  
**Repository Id:** REPO-GLYPH-DB-MIGRATIONS  
**Pattern Ids:**
    
    
**Members:**
    
    
**Methods:**
    
    
**Implemented Features:**
    
    - Type Safety for Migrations
    
**Requirement Ids:**
    
    
**Purpose:** To provide strong typing for MongoDB documents, reducing errors and improving developer experience when writing migration logic.  
**Logic Description:** This file will export several TypeScript interfaces, such as `IPlayerProfile`, `ILevelProgress`, `ILeaderboard`, etc. Each interface will mirror the structure of a document in a MongoDB collection, including field names and their corresponding TypeScript types (e.g., `string`, `number`, `Date`, `ObjectId`).  
**Documentation:**
    
    - **Summary:** A central file for TypeScript type definitions. It ensures that migration scripts interacting with the database do so in a type-safe manner, preventing common errors like typos in field names.
    
**Namespace:** GlyphWeaver.Backend.Migrations.Types  
**Metadata:**
    
    - **Category:** Utility
    


---

# 2. Configuration

- **Feature Toggles:**
  
  
- **Database Configs:**
  
  - MIGRATE_MONGO_URI
  - MIGRATE_MONGO_DATABASE_NAME
  - MIGRATE_MONGO_COLLECTION
  


---

