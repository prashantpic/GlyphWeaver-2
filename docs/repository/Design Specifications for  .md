# Software Design Specification (SDS) for REPO-GLYPH-DB-MIGRATIONS

## 1. Introduction

### 1.1. Purpose
This document provides a detailed software design specification for the `REPO-GLYPH-DB-MIGRATIONS` repository. Its purpose is to guide the development of version-controlled database migration scripts for the Glyph Weaver project. These scripts will manage the evolution of the MongoDB database schema, ensuring consistency, reliability, and automated deployment across all environments (local, staging, production).

### 1.2. Scope
The scope of this repository is strictly limited to the creation, management, and execution of database schema migration scripts. It is a command-line toolset, not a continuously running service. It will interact directly with the MongoDB database as defined in the project's overall database design.

## 2. System Overview & Design Principles

### 2.1. Architectural Role
This repository provides the mechanism for Database-as-Code. It decouples the database schema's state from the application's code, allowing the schema to be versioned and deployed independently but in coordination with application deployments. It is a critical component of the CI/CD process for the backend.

### 2.2. Design Principles
*   **Version Controlled**: Every change to the database schema must be captured in a new, timestamped migration script and committed to version control.
*   **Automated**: Migrations must be executable via simple CLI commands, suitable for integration into an automated CI/CD pipeline.
*   **Reliable & Repeatable**: Executing migrations must produce the same result on any target database, regardless of its current state (within the migration path).
*   **Reversible**: Every migration script (`up`) must have a corresponding `down` script to revert the changes, facilitating rollbacks.
*   **Environment Agnostic**: The configuration must support different database connection details for local, staging, and production environments through the use of environment variables.

### 2.3. Technology Stack
*   **Runtime**: Node.js (TypeScript)
*   **Database**: MongoDB
*   **Migration Framework**: `migrate-mongo`
*   **Language**: TypeScript

## 3. Detailed Component Specification

This section details the design of each file within the repository structure.

### 3.1. `package.json`
This file defines the project's dependencies, development dependencies, and scripts for interacting with the migration tool.

*   **Purpose**: To manage Node.js project dependencies and define standardized scripts for executing migrations.
*   **`dependencies`**:
    *   `migrate-mongo`: The core migration framework.
    *   `mongodb`: The official MongoDB driver, required by `migrate-mongo`.
    *   `dotenv`: To load environment variables from a `.env` file for local development.
*   **`devDependencies`**:
    *   `typescript`: The TypeScript compiler.
    *   `ts-node`: To run TypeScript files directly without pre-compilation.
    *   `@types/node`: TypeScript type definitions for Node.js.
*   **`scripts`**:
    *   `"build"`: `"tsc"` - Compiles TypeScript files to JavaScript.
    *   `"migrate:create <name>"`: `"migrate-mongo create <name>"` - Creates a new migration file.
    *   `"migrate:up"`: `"migrate-mongo up"` - Applies all pending migrations.
    *   `"migrate:down"`: `"migrate-mongo down"` - Reverts the last applied migration.
    *   `"migrate:status"`: `"migrate-mongo status"` - Shows the status of all migrations.

### 3.2. `tsconfig.json`
This file configures the TypeScript compiler for the project.

*   **Purpose**: To ensure consistent and correct compilation of TypeScript migration scripts into JavaScript that Node.js can execute.
*   **`compilerOptions`**:
    *   `"target"`: `"ES2020"` - Specifies the target ECMAScript version.
    *   `"module"`: `"commonjs"` - Specifies the module system.
    *   `"rootDir"`: `"./"` - The root directory of source files.
    *   `"outDir"`: `"./dist"` - The output directory for compiled JavaScript files.
    *   `"strict"`: `true` - Enables all strict type-checking options.
    *   `"esModuleInterop"`: `true` - Enables interoperability between CommonJS and ES Modules.
*   **`include`**:
    *   `["migrations/**/*.ts", "migrate-mongo-config.ts", "src/**/*.ts"]` - Specifies the files to be included in the compilation.

### 3.3. `migrate-mongo-config.ts`
This file provides the runtime configuration for the `migrate-mongo` tool.

*   **Purpose**: To connect the migration tool to the correct MongoDB instance and specify where migration files and history are located.
*   **Logic**:
    1.  The script will import `dotenv` and call `dotenv.config()` to load environment variables.
    2.  It will export a configuration object that reads the following from `process.env`:
        *   `mongodb.url`: The MongoDB connection string (e.g., `MIGRATE_MONGO_URI`).
        *   `mongodb.databaseName`: The name of the target database (e.g., `MIGRATE_MONGO_DATABASE_NAME`).
        *   `mongodb.options`: Set `{ useNewUrlParser: true, useUnifiedTopology: true }`.
    3.  The configuration object will also statically define:
        *   `migrationsDir`: `"migrations"` - The directory containing migration scripts.
        *   `changelogCollectionName`: `"changelog"` - The collection where migration history is stored.

### 3.4. Migration Script Structure
All migration scripts will follow a consistent structure and naming convention.

*   **Naming Convention**: `YYYYMMDDHHMMSS-descriptive-name.ts` (e.g., `20250520100000-initial-schema-setup.ts`).
*   **Structure**: Each file must export two asynchronous functions: `up` and `down`.
    typescript
    import { Db, MongoClient } from 'mongodb';

    export const up = async (db: Db, client: MongoClient): Promise<void> => {
      // Logic to apply the migration.
      // e.g., await db.createCollection('MyNewCollection');
    };

    export const down = async (db: Db, client: MongoClient): Promise<void> => {
      // Logic to revert the migration.
      // e.g., await db.collection('MyNewCollection').drop();
    };
    

### 3.5. Type Definitions (`src/types/collections.ts`)
This file provides TypeScript interfaces for MongoDB documents to ensure type safety in migration scripts.

*   **Purpose**: To prevent common errors (e.g., typos in field names) and improve code readability and maintainability when writing migration logic.
*   **Implementation**: This file will export interfaces that reflect the schemas defined in the database design document.
    *   Example:
        typescript
        import { ObjectId } from 'mongodb';

        export interface IPlayerProfile {
          _id: ObjectId;
          username: string;
          email?: string;
          // ... other fields
        }

        export interface IPlayerScore {
          _id: ObjectId;
          userId: ObjectId;
          leaderboardId: ObjectId;
          scoreValue: number;
          // ... other fields
        }
        

## 4. Specific Migration Implementations

### 4.1. `20250520100000-initial-schema-setup.ts`
This is the foundational migration to set up the entire initial database schema.

*   **`up(db: Db)` function logic**:
    1.  Create all required collections as defined in the Database Design document (e.g., `Zone`, `Level`, `PlayerProfile`, `LevelProgress`, `Leaderboard`, `PlayerScore`, `Achievement`, `PlayerAchievement`, `IAPTransaction`, etc.). Use `await db.createCollection('CollectionName');`.
    2.  For each collection, create all specified indexes.
        *   **Example for `PlayerProfile`**:
            typescript
            await db.collection('PlayerProfile').createIndex({ username: 1 }, { unique: true });
            await db.collection('PlayerProfile').createIndex({ platformId: 1 }, { sparse: true });
            
        *   **Example for `PlayerScore`**:
            typescript
            await db.collection('PlayerScore').createIndex({ leaderboardId: 1, scoreValue: -1, timestamp: 1 });
            await db.collection('PlayerScore').createIndex({ userId: 1, leaderboardId: 1 });
            
        *   **Example for `LevelProgress`**:
            typescript
            await db.collection('LevelProgress').createIndex({ userId: 1, levelId: 1, isProcedural: 1 }, { unique: true });
            
    3.  This function should be structured with clear comments for each collection and its indexes.

*   **`down(db: Db)` function logic**:
    1.  Drop all collections created in the `up` function in reverse order of creation. Use `await db.collection('CollectionName').drop();`. This ensures a clean rollback to an empty state.

### 4.2. `20250615120000-add-player-inventory.ts`
This migration adds support for the player inventory feature.

*   **`up(db: Db)` function logic**:
    1.  Create the `PlayerInventory` collection: `await db.createCollection('PlayerInventory');`.
    2.  Create the unique compound index: `await db.collection('PlayerInventory').createIndex({ userId: 1, type: 1, keyName: 1 }, { unique: true });`.
    3.  Create the query index on `userId`: `await db.collection('PlayerInventory').createIndex({ userId: 1 });`.

*   **`down(db: Db)` function logic**:
    1.  Drop the `PlayerInventory` collection: `await db.collection('PlayerInventory').drop();`.

### 4.3. `20250701093000-add-last-login-to-player-profile.ts`
This migration adds the `lastLogin` field to the `PlayerProfile` collection.

*   **`up(db: Db)` function logic**:
    1.  Update existing documents to add the `lastLogin` field. A sensible default is the user's creation date.
        typescript
        await db.collection('PlayerProfile').updateMany(
          { lastLogin: { $exists: false } },
          [{ $set: { lastLogin: "$createdAt" } }] // Use aggregation pipeline to set lastLogin to createdAt
        );
        

*   **`down(db: Db)` function logic**:
    1.  Remove the `lastLogin` field from all documents in the collection.
        typescript
        await db.collection('PlayerProfile').updateMany(
          {},
          { $unset: { lastLogin: "" } }
        );
        

## 5. Execution and CI/CD Integration
The scripts in this repository are designed to be run from a CI/CD pipeline (e.g., GitHub Actions as defined in `REPO-GLYPH-CICD-PIPELINES`).

*   **Workflow**:
    1.  A developer creates a new migration script locally using `npm run migrate:create -- "add-new-feature"`.
    2.  The developer implements the `up` and `down` logic and commits the file.
    3.  Upon merging to a deployment branch (e.g., `main`, `develop`), the CI/CD pipeline triggers.
    4.  As part of the backend deployment job, before the new application code is live, the pipeline will execute the following commands:
        *   `npm install`
        *   `npm run build`
        *   `npm run migrate:up`
    5.  This ensures the database schema is updated to the required version before the application that depends on it is deployed.
*   **Rollback**: Manual intervention or a specialized rollback pipeline job would be required to execute `npm run migrate:down` in case of a failed deployment. This is a deliberate, non-default action.