erDiagram
    Zone {
        UUID zoneId "PK"
        VARCHAR name
        TEXT description
        VARCHAR unlockCondition
        INT gridMinSize
        INT gridMaxSize
        INT maxGlyphTypes
        DateTime createdAt
        DateTime updatedAt
    }
    Level {
        UUID levelId "PK"
        UUID zoneId "FK to Zone"
        INT levelNumber
        VARCHAR type
        INT gridSize
        INT timeLimit
        INT moveLimit
        DECIMAL difficultyRating
        VARCHAR generationSeed
        DateTime createdAt
        DateTime updatedAt
    }
    PuzzleType {
        UUID puzzleTypeId "PK"
        VARCHAR name "UNIQUE"
        TEXT description
        JSON validationRules
    }
    Obstacle {
        UUID obstacleId "PK"
        VARCHAR name "UNIQUE"
        VARCHAR type
        JSON movementPattern
        JSON interactionRules
    }
    Glyph {
        UUID glyphId "PK"
        VARCHAR type
        CHAR colorCode
        VARCHAR symbol
        JSON interactionRules
        VARCHAR accessibilityPattern
    }
    PlayerProfile {
        UUID userId "PK"
        VARCHAR platformId
        VARCHAR username "UNIQUE"
        VARCHAR email
        UUID currentZone "FK to Zone"
        BIGINT totalScore
        DateTime createdAt
        DateTime lastLogin
        BOOLEAN isDeleted
    }
    UserSettings {
        UUID userId "PK, FK to PlayerProfile"
        VARCHAR colorblindMode
        INT textSize
        BOOLEAN reducedMotion
        VARCHAR inputMethod
        DECIMAL musicVolume
        DECIMAL sfxVolume
        DateTime lastUpdated
    }
    LevelProgress {
        UUID progressId "PK"
        UUID userId "FK to PlayerProfile"
        UUID levelId "FK to Level"
        INT starsEarned
        INT completionTime
        INT moveCount
        INT hintsUsed
        INT undosUsed
        DateTime lastAttempt
    }
    InAppPurchase {
        UUID itemId "PK"
        VARCHAR sku "UNIQUE"
        VARCHAR name
        VARCHAR type
        DECIMAL price
        CHAR currencyCode
        VARCHAR platformProductId
        BOOLEAN isActive
    }
    PlayerInventory {
        UUID inventoryId "PK"
        UUID userId "FK to PlayerProfile"
        UUID itemId "FK to InAppPurchase"
        INT quantity
        DateTime lastAcquired
    }
    Leaderboard {
        UUID leaderboardId "PK"
        VARCHAR name
        VARCHAR scope
        VARCHAR scoringType
        INT refreshInterval
        BOOLEAN isActive
    }
    PlayerScore {
        UUID scoreId "PK"
        UUID userId "FK to PlayerProfile"
        UUID leaderboardId "FK to Leaderboard"
        BIGINT scoreValue
        DateTime timestamp
        VARCHAR validationHash
    }
    CloudSave {
        UUID saveId "PK"
        UUID userId "FK to PlayerProfile"
        VARCHAR platform
        JSON saveData
        INT version
        DateTime lastSynced
    }
    ProceduralLevel {
        UUID generatedLevelId "PK"
        UUID baseLevelId "FK to Level"
        JSON generationParameters
        JSON solutionPath
        DECIMAL complexityScore
        DateTime generatedAt
    }
    AuditLog {
        UUID logId "PK"
        VARCHAR eventType
        UUID userId "FK to PlayerProfile, Nullable"
        VARCHAR ipAddress
        JSON details
        DateTime timestamp
    }

    Zone ||--o{ Level : "Zone_Level"
    PlayerProfile ||--o{ LevelProgress : "PlayerProfile_LevelProgress"
    Level ||--o{ LevelProgress : "Level_LevelProgress"
    PlayerProfile ||--|| UserSettings : "PlayerProfile_UserSettings"
    PlayerProfile ||--o{ PlayerInventory : "Part_of_PlayerProfile_InAppPurchase"
    InAppPurchase ||--o{ PlayerInventory : "Part_of_PlayerProfile_InAppPurchase"
    Leaderboard ||--o{ PlayerScore : "Part_of_Leaderboard_PlayerProfile"
    PlayerProfile ||--o{ PlayerScore : "Part_of_Leaderboard_PlayerProfile"
    Level ||--o{ ProceduralLevel : "Level_ProceduralLevel"
    PlayerProfile ||--o{ CloudSave : "PlayerProfile_CloudSave"
    PlayerProfile ||--o{ AuditLog : "PlayerProfile_AuditLog"
    Level }o--o{ Glyph : "Level_Glyph (via LevelGlyph)"
    Level }o--o{ Obstacle : "Level_Obstacle (via LevelObstacle)"
    Level }o--o{ PuzzleType : "Level_PuzzleType (via LevelPuzzleType)"

    Zone ||--|{ PlayerProfile : "current_zone_for_profile (FK: PlayerProfile.currentZone)"
