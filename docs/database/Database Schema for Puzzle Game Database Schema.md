# Specification

# 1. Database Design

## 1.1. Zone
Represents distinct game zones with progression parameters. Optimization: Consider application-level or distributed caching for this rarely changing data.

### 1.1.3. Attributes

### 1.1.3.1. zoneId
#### 1.1.3.1.2. Type
UUID

#### 1.1.3.1.3. Is Required
True

#### 1.1.3.1.4. Is Primary Key
True

### 1.1.3.2. name
#### 1.1.3.2.2. Type
VARCHAR

#### 1.1.3.2.3. Is Required
True

#### 1.1.3.2.4. Size
50

### 1.1.3.3. description
#### 1.1.3.3.2. Type
TEXT

#### 1.1.3.3.3. Is Required
False

### 1.1.3.4. unlockCondition
#### 1.1.3.4.2. Type
VARCHAR

#### 1.1.3.4.3. Is Required
True

#### 1.1.3.4.4. Size
100

### 1.1.3.5. gridMinSize
#### 1.1.3.5.2. Type
INT

#### 1.1.3.5.3. Is Required
True

### 1.1.3.6. gridMaxSize
#### 1.1.3.6.2. Type
INT

#### 1.1.3.6.3. Is Required
True

### 1.1.3.7. maxGlyphTypes
#### 1.1.3.7.2. Type
INT

#### 1.1.3.7.3. Is Required
True

### 1.1.3.8. createdAt
#### 1.1.3.8.2. Type
DateTime

#### 1.1.3.8.3. Is Required
True

### 1.1.3.9. updatedAt
#### 1.1.3.9.2. Type
DateTime

#### 1.1.3.9.3. Is Required
True


### 1.1.4. Primary Keys

- zoneId

### 1.1.5. Unique Constraints


### 1.1.6. Indexes


## 1.2. Level
Stores level configuration and progression data. Optimization: Consider application-level or distributed caching for handcrafted level configurations.

### 1.2.3. Attributes

### 1.2.3.1. levelId
#### 1.2.3.1.2. Type
UUID

#### 1.2.3.1.3. Is Required
True

#### 1.2.3.1.4. Is Primary Key
True

### 1.2.3.2. zoneId
#### 1.2.3.2.2. Type
UUID

#### 1.2.3.2.3. Is Required
True

#### 1.2.3.2.4. Is Foreign Key
True

### 1.2.3.3. levelNumber
#### 1.2.3.3.2. Type
INT

#### 1.2.3.3.3. Is Required
True

### 1.2.3.4. type
#### 1.2.3.4.2. Type
VARCHAR

#### 1.2.3.4.3. Is Required
True

#### 1.2.3.4.4. Size
20

#### 1.2.3.4.5. Constraints

- CHECK (type IN ('handcrafted', 'procedural'))

### 1.2.3.5. gridSize
#### 1.2.3.5.2. Type
INT

#### 1.2.3.5.3. Is Required
True

### 1.2.3.6. timeLimit
#### 1.2.3.6.2. Type
INT

#### 1.2.3.6.3. Is Required
False

### 1.2.3.7. moveLimit
#### 1.2.3.7.2. Type
INT

#### 1.2.3.7.3. Is Required
False

### 1.2.3.8. difficultyRating
#### 1.2.3.8.2. Type
DECIMAL

#### 1.2.3.8.3. Is Required
True

#### 1.2.3.8.4. Precision
3

#### 1.2.3.8.5. Scale
2

### 1.2.3.9. generationSeed
#### 1.2.3.9.2. Type
VARCHAR

#### 1.2.3.9.3. Is Required
False

#### 1.2.3.9.4. Size
64

### 1.2.3.10. createdAt
#### 1.2.3.10.2. Type
DateTime

#### 1.2.3.10.3. Is Required
True

### 1.2.3.11. updatedAt
#### 1.2.3.11.2. Type
DateTime

#### 1.2.3.11.3. Is Required
True


### 1.2.4. Primary Keys

- levelId

### 1.2.5. Unique Constraints


### 1.2.6. Indexes

### 1.2.6.1. idx_level_zoneid_levelnumber
#### 1.2.6.1.2. Columns

- zoneId
- levelNumber

#### 1.2.6.1.3. Type
BTree


## 1.3. PuzzleType
Defines available puzzle mechanics and rules. Optimization: Consider application-level or distributed caching for this rarely changing data.

### 1.3.3. Attributes

### 1.3.3.1. puzzleTypeId
#### 1.3.3.1.2. Type
UUID

#### 1.3.3.1.3. Is Required
True

#### 1.3.3.1.4. Is Primary Key
True

### 1.3.3.2. name
#### 1.3.3.2.2. Type
VARCHAR

#### 1.3.3.2.3. Is Required
True

#### 1.3.3.2.4. Size
50

#### 1.3.3.2.5. Is Unique
True

### 1.3.3.3. description
#### 1.3.3.3.2. Type
TEXT

#### 1.3.3.3.3. Is Required
True

### 1.3.3.4. validationRules
#### 1.3.3.4.2. Type
JSON

#### 1.3.3.4.3. Is Required
True


### 1.3.4. Primary Keys

- puzzleTypeId

### 1.3.5. Unique Constraints

### 1.3.5.1. uq_puzzletype_name
#### 1.3.5.1.2. Columns

- name


### 1.3.6. Indexes


## 1.4. Obstacle
Catalog of obstacle types and their properties. Optimization: Consider application-level or distributed caching for this rarely changing data.

### 1.4.3. Attributes

### 1.4.3.1. obstacleId
#### 1.4.3.1.2. Type
UUID

#### 1.4.3.1.3. Is Required
True

#### 1.4.3.1.4. Is Primary Key
True

### 1.4.3.2. name
#### 1.4.3.2.2. Type
VARCHAR

#### 1.4.3.2.3. Is Required
True

#### 1.4.3.2.4. Size
50

#### 1.4.3.2.5. Is Unique
True

### 1.4.3.3. type
#### 1.4.3.3.2. Type
VARCHAR

#### 1.4.3.3.3. Is Required
True

#### 1.4.3.3.4. Size
20

#### 1.4.3.3.5. Constraints

- CHECK (type IN ('blocker', 'shifting', 'dynamic'))

### 1.4.3.4. movementPattern
#### 1.4.3.4.2. Type
JSON

#### 1.4.3.4.3. Is Required
False

### 1.4.3.5. interactionRules
#### 1.4.3.5.2. Type
JSON

#### 1.4.3.5.3. Is Required
True


### 1.4.4. Primary Keys

- obstacleId

### 1.4.5. Unique Constraints

### 1.4.5.1. uq_obstacle_name
#### 1.4.5.1.2. Columns

- name


### 1.4.6. Indexes


## 1.5. Glyph
Defines glyph types and their behavioral properties. Optimization: Consider application-level or distributed caching for this rarely changing data.

### 1.5.3. Attributes

### 1.5.3.1. glyphId
#### 1.5.3.1.2. Type
UUID

#### 1.5.3.1.3. Is Required
True

#### 1.5.3.1.4. Is Primary Key
True

### 1.5.3.2. type
#### 1.5.3.2.2. Type
VARCHAR

#### 1.5.3.2.3. Is Required
True

#### 1.5.3.2.4. Size
20

#### 1.5.3.2.5. Constraints

- CHECK (type IN ('standard', 'mirror', 'linked', 'catalyst'))

### 1.5.3.3. colorCode
#### 1.5.3.3.2. Type
CHAR

#### 1.5.3.3.3. Is Required
True

#### 1.5.3.3.4. Size
7

### 1.5.3.4. symbol
#### 1.5.3.4.2. Type
VARCHAR

#### 1.5.3.4.3. Is Required
True

#### 1.5.3.4.4. Size
10

### 1.5.3.5. interactionRules
#### 1.5.3.5.2. Type
JSON

#### 1.5.3.5.3. Is Required
True

### 1.5.3.6. accessibilityPattern
#### 1.5.3.6.2. Type
VARCHAR

#### 1.5.3.6.3. Is Required
True

#### 1.5.3.6.4. Size
20


### 1.5.4. Primary Keys

- glyphId

### 1.5.5. Unique Constraints


### 1.5.6. Indexes


## 1.6. PlayerProfile
Main player identity and progression tracking. Optimization: Consider caching PlayerProfile data for active users.

### 1.6.3. Attributes

### 1.6.3.1. userId
#### 1.6.3.1.2. Type
UUID

#### 1.6.3.1.3. Is Required
True

#### 1.6.3.1.4. Is Primary Key
True

### 1.6.3.2. platformId
#### 1.6.3.2.2. Type
VARCHAR

#### 1.6.3.2.3. Is Required
False

#### 1.6.3.2.4. Size
255

### 1.6.3.3. username
#### 1.6.3.3.2. Type
VARCHAR

#### 1.6.3.3.3. Is Required
True

#### 1.6.3.3.4. Size
50

#### 1.6.3.3.5. Is Unique
True

### 1.6.3.4. email
#### 1.6.3.4.2. Type
VARCHAR

#### 1.6.3.4.3. Is Required
False

#### 1.6.3.4.4. Size
255

### 1.6.3.5. currentZone
#### 1.6.3.5.2. Type
UUID

#### 1.6.3.5.3. Is Required
True

#### 1.6.3.5.4. Is Foreign Key
True

### 1.6.3.6. totalScore
Denormalized total score. Ensure robust application-level logic or database triggers for consistent incremental updates when points are earned (e.g., from LevelProgress, PlayerScore, Catalyst glyphs).

#### 1.6.3.6.2. Type
BIGINT

#### 1.6.3.6.3. Is Required
True

#### 1.6.3.6.4. Default Value
0

### 1.6.3.7. createdAt
#### 1.6.3.7.2. Type
DateTime

#### 1.6.3.7.3. Is Required
True

### 1.6.3.8. lastLogin
#### 1.6.3.8.2. Type
DateTime

#### 1.6.3.8.3. Is Required
False

### 1.6.3.9. isDeleted
#### 1.6.3.9.2. Type
BOOLEAN

#### 1.6.3.9.3. Is Required
True

#### 1.6.3.9.4. Default Value
false


### 1.6.4. Primary Keys

- userId

### 1.6.5. Unique Constraints

### 1.6.5.1. uq_playerprofile_username
#### 1.6.5.1.2. Columns

- username


### 1.6.6. Indexes


## 1.7. UserSettings
Player preferences and accessibility configurations. Optimization: Consider caching UserSettings data for active users.

### 1.7.3. Attributes

### 1.7.3.1. userId
#### 1.7.3.1.2. Type
UUID

#### 1.7.3.1.3. Is Required
True

#### 1.7.3.1.4. Is Primary Key
True

#### 1.7.3.1.5. Is Foreign Key
True

### 1.7.3.2. colorblindMode
#### 1.7.3.2.2. Type
VARCHAR

#### 1.7.3.2.3. Is Required
True

#### 1.7.3.2.4. Size
20

#### 1.7.3.2.5. Default Value
'none'

### 1.7.3.3. textSize
#### 1.7.3.3.2. Type
INT

#### 1.7.3.3.3. Is Required
True

#### 1.7.3.3.4. Default Value
16

### 1.7.3.4. reducedMotion
#### 1.7.3.4.2. Type
BOOLEAN

#### 1.7.3.4.3. Is Required
True

#### 1.7.3.4.4. Default Value
false

### 1.7.3.5. inputMethod
#### 1.7.3.5.2. Type
VARCHAR

#### 1.7.3.5.3. Is Required
True

#### 1.7.3.5.4. Size
20

#### 1.7.3.5.5. Default Value
'swipe'

### 1.7.3.6. musicVolume
#### 1.7.3.6.2. Type
DECIMAL

#### 1.7.3.6.3. Is Required
True

#### 1.7.3.6.4. Precision
3

#### 1.7.3.6.5. Scale
2

#### 1.7.3.6.6. Default Value
1.0

### 1.7.3.7. sfxVolume
#### 1.7.3.7.2. Type
DECIMAL

#### 1.7.3.7.3. Is Required
True

#### 1.7.3.7.4. Precision
3

#### 1.7.3.7.5. Scale
2

#### 1.7.3.7.6. Default Value
1.0

### 1.7.3.8. lastUpdated
#### 1.7.3.8.2. Type
DateTime

#### 1.7.3.8.3. Is Required
True


### 1.7.4. Primary Keys

- userId

### 1.7.5. Unique Constraints


### 1.7.6. Indexes


## 1.8. LevelProgress
Tracks player progression through individual levels

### 1.8.3. Attributes

### 1.8.3.1. progressId
#### 1.8.3.1.2. Type
UUID

#### 1.8.3.1.3. Is Required
True

#### 1.8.3.1.4. Is Primary Key
True

### 1.8.3.2. userId
#### 1.8.3.2.2. Type
UUID

#### 1.8.3.2.3. Is Required
True

#### 1.8.3.2.4. Is Foreign Key
True

### 1.8.3.3. levelId
#### 1.8.3.3.2. Type
UUID

#### 1.8.3.3.3. Is Required
True

#### 1.8.3.3.4. Is Foreign Key
True

### 1.8.3.4. starsEarned
#### 1.8.3.4.2. Type
INT

#### 1.8.3.4.3. Is Required
True

#### 1.8.3.4.4. Constraints

- CHECK (starsEarned BETWEEN 0 AND 3)

### 1.8.3.5. completionTime
#### 1.8.3.5.2. Type
INT

#### 1.8.3.5.3. Is Required
False

### 1.8.3.6. moveCount
#### 1.8.3.6.2. Type
INT

#### 1.8.3.6.3. Is Required
False

### 1.8.3.7. hintsUsed
#### 1.8.3.7.2. Type
INT

#### 1.8.3.7.3. Is Required
True

#### 1.8.3.7.4. Default Value
0

### 1.8.3.8. undosUsed
#### 1.8.3.8.2. Type
INT

#### 1.8.3.8.3. Is Required
True

#### 1.8.3.8.4. Default Value
0

### 1.8.3.9. lastAttempt
#### 1.8.3.9.2. Type
DateTime

#### 1.8.3.9.3. Is Required
True


### 1.8.4. Primary Keys

- progressId

### 1.8.5. Unique Constraints

### 1.8.5.1. uq_levelprogress_userid_levelid
#### 1.8.5.1.2. Columns

- userId
- levelId


### 1.8.6. Indexes

### 1.8.6.1. idx_levelprogress_userid_levelid
#### 1.8.6.1.2. Columns

- userId
- levelId

#### 1.8.6.1.3. Type
BTree


## 1.9. InAppPurchase
Catalog of available in-app purchase items

### 1.9.3. Attributes

### 1.9.3.1. itemId
#### 1.9.3.1.2. Type
UUID

#### 1.9.3.1.3. Is Required
True

#### 1.9.3.1.4. Is Primary Key
True

### 1.9.3.2. sku
#### 1.9.3.2.2. Type
VARCHAR

#### 1.9.3.2.3. Is Required
True

#### 1.9.3.2.4. Size
50

#### 1.9.3.2.5. Is Unique
True

### 1.9.3.3. name
#### 1.9.3.3.2. Type
VARCHAR

#### 1.9.3.3.3. Is Required
True

#### 1.9.3.3.4. Size
100

### 1.9.3.4. type
#### 1.9.3.4.2. Type
VARCHAR

#### 1.9.3.4.3. Is Required
True

#### 1.9.3.4.4. Size
20

#### 1.9.3.4.5. Constraints

- CHECK (type IN ('hint_pack', 'undo_pack', 'cosmetic', 'currency'))

### 1.9.3.5. price
#### 1.9.3.5.2. Type
DECIMAL

#### 1.9.3.5.3. Is Required
True

#### 1.9.3.5.4. Precision
10

#### 1.9.3.5.5. Scale
2

### 1.9.3.6. currencyCode
#### 1.9.3.6.2. Type
CHAR

#### 1.9.3.6.3. Is Required
True

#### 1.9.3.6.4. Size
3

### 1.9.3.7. platformProductId
#### 1.9.3.7.2. Type
VARCHAR

#### 1.9.3.7.3. Is Required
True

#### 1.9.3.7.4. Size
255

### 1.9.3.8. isActive
#### 1.9.3.8.2. Type
BOOLEAN

#### 1.9.3.8.3. Is Required
True

#### 1.9.3.8.4. Default Value
true


### 1.9.4. Primary Keys

- itemId

### 1.9.5. Unique Constraints

### 1.9.5.1. uq_inapppurchase_sku
#### 1.9.5.1.2. Columns

- sku


### 1.9.6. Indexes


## 1.10. PlayerInventory
Tracks player-owned items and currency

### 1.10.3. Attributes

### 1.10.3.1. inventoryId
#### 1.10.3.1.2. Type
UUID

#### 1.10.3.1.3. Is Required
True

#### 1.10.3.1.4. Is Primary Key
True

### 1.10.3.2. userId
#### 1.10.3.2.2. Type
UUID

#### 1.10.3.2.3. Is Required
True

#### 1.10.3.2.4. Is Foreign Key
True

### 1.10.3.3. itemId
#### 1.10.3.3.2. Type
UUID

#### 1.10.3.3.3. Is Required
True

#### 1.10.3.3.4. Is Foreign Key
True

### 1.10.3.4. quantity
#### 1.10.3.4.2. Type
INT

#### 1.10.3.4.3. Is Required
True

#### 1.10.3.4.4. Default Value
0

### 1.10.3.5. lastAcquired
#### 1.10.3.5.2. Type
DateTime

#### 1.10.3.5.3. Is Required
True


### 1.10.4. Primary Keys

- inventoryId

### 1.10.5. Unique Constraints

### 1.10.5.1. uq_playerinventory_userid_itemid
#### 1.10.5.1.2. Columns

- userId
- itemId


### 1.10.6. Indexes


## 1.11. Leaderboard
Defines leaderboard types and configurations

### 1.11.3. Attributes

### 1.11.3.1. leaderboardId
#### 1.11.3.1.2. Type
UUID

#### 1.11.3.1.3. Is Required
True

#### 1.11.3.1.4. Is Primary Key
True

### 1.11.3.2. name
#### 1.11.3.2.2. Type
VARCHAR

#### 1.11.3.2.3. Is Required
True

#### 1.11.3.2.4. Size
100

### 1.11.3.3. scope
#### 1.11.3.3.2. Type
VARCHAR

#### 1.11.3.3.3. Is Required
True

#### 1.11.3.3.4. Size
20

#### 1.11.3.3.5. Constraints

- CHECK (scope IN ('global', 'friends', 'event'))

### 1.11.3.4. scoringType
#### 1.11.3.4.2. Type
VARCHAR

#### 1.11.3.4.3. Is Required
True

#### 1.11.3.4.4. Size
20

#### 1.11.3.4.5. Constraints

- CHECK (scoringType IN ('time', 'moves', 'score'))

### 1.11.3.5. refreshInterval
#### 1.11.3.5.2. Type
INT

#### 1.11.3.5.3. Is Required
True

### 1.11.3.6. isActive
#### 1.11.3.6.2. Type
BOOLEAN

#### 1.11.3.6.3. Is Required
True

#### 1.11.3.6.4. Default Value
true


### 1.11.4. Primary Keys

- leaderboardId

### 1.11.5. Unique Constraints


### 1.11.6. Indexes


## 1.12. PlayerScore
Records player scores for leaderboard participation. Optimization: Consider partitioning this table by timestamp (for time-limited events) or leaderboardId (for global/zone leaderboards) to manage large datasets and improve query performance.

### 1.12.3. Attributes

### 1.12.3.1. scoreId
#### 1.12.3.1.2. Type
UUID

#### 1.12.3.1.3. Is Required
True

#### 1.12.3.1.4. Is Primary Key
True

### 1.12.3.2. userId
#### 1.12.3.2.2. Type
UUID

#### 1.12.3.2.3. Is Required
True

#### 1.12.3.2.4. Is Foreign Key
True

### 1.12.3.3. leaderboardId
#### 1.12.3.3.2. Type
UUID

#### 1.12.3.3.3. Is Required
True

#### 1.12.3.3.4. Is Foreign Key
True

### 1.12.3.4. scoreValue
#### 1.12.3.4.2. Type
BIGINT

#### 1.12.3.4.3. Is Required
True

### 1.12.3.5. timestamp
#### 1.12.3.5.2. Type
DateTime

#### 1.12.3.5.3. Is Required
True

### 1.12.3.6. validationHash
#### 1.12.3.6.2. Type
VARCHAR

#### 1.12.3.6.3. Is Required
True

#### 1.12.3.6.4. Size
64


### 1.12.4. Primary Keys

- scoreId

### 1.12.5. Unique Constraints


### 1.12.6. Indexes

### 1.12.6.1. idx_playerscore_leaderboardid_scorevalue
#### 1.12.6.1.2. Columns

- leaderboardId
- scoreValue

#### 1.12.6.1.3. Type
BTree


## 1.13. CloudSave
Stores cloud-synced player progression data

### 1.13.3. Attributes

### 1.13.3.1. saveId
#### 1.13.3.1.2. Type
UUID

#### 1.13.3.1.3. Is Required
True

#### 1.13.3.1.4. Is Primary Key
True

### 1.13.3.2. userId
#### 1.13.3.2.2. Type
UUID

#### 1.13.3.2.3. Is Required
True

#### 1.13.3.2.4. Is Foreign Key
True

### 1.13.3.3. platform
#### 1.13.3.3.2. Type
VARCHAR

#### 1.13.3.3.3. Is Required
True

#### 1.13.3.3.4. Size
20

### 1.13.3.4. saveData
#### 1.13.3.4.2. Type
JSON

#### 1.13.3.4.3. Is Required
True

### 1.13.3.5. version
#### 1.13.3.5.2. Type
INT

#### 1.13.3.5.3. Is Required
True

### 1.13.3.6. lastSynced
#### 1.13.3.6.2. Type
DateTime

#### 1.13.3.6.3. Is Required
True


### 1.13.4. Primary Keys

- saveId

### 1.13.5. Unique Constraints


### 1.13.6. Indexes

### 1.13.6.1. idx_cloudsave_userid_lastsynced
#### 1.13.6.1.2. Columns

- userId
- lastSynced

#### 1.13.6.1.3. Type
BTree


## 1.14. ProceduralLevel
Stores generated level instances and parameters

### 1.14.3. Attributes

### 1.14.3.1. generatedLevelId
#### 1.14.3.1.2. Type
UUID

#### 1.14.3.1.3. Is Required
True

#### 1.14.3.1.4. Is Primary Key
True

### 1.14.3.2. baseLevelId
#### 1.14.3.2.2. Type
UUID

#### 1.14.3.2.3. Is Required
True

#### 1.14.3.2.4. Is Foreign Key
True

### 1.14.3.3. generationParameters
#### 1.14.3.3.2. Type
JSON

#### 1.14.3.3.3. Is Required
True

### 1.14.3.4. solutionPath
#### 1.14.3.4.2. Type
JSON

#### 1.14.3.4.3. Is Required
True

### 1.14.3.5. complexityScore
#### 1.14.3.5.2. Type
DECIMAL

#### 1.14.3.5.3. Is Required
True

#### 1.14.3.5.4. Precision
5

#### 1.14.3.5.5. Scale
2

### 1.14.3.6. generatedAt
#### 1.14.3.6.2. Type
DateTime

#### 1.14.3.6.3. Is Required
True


### 1.14.4. Primary Keys

- generatedLevelId

### 1.14.5. Unique Constraints


### 1.14.6. Indexes


## 1.15. AuditLog
Tracks system events for security and debugging. Optimization: Consider range partitioning on the `timestamp` attribute for efficient management of large log volumes and improved query performance on recent data.

### 1.15.3. Attributes

### 1.15.3.1. logId
#### 1.15.3.1.2. Type
UUID

#### 1.15.3.1.3. Is Required
True

#### 1.15.3.1.4. Is Primary Key
True

### 1.15.3.2. eventType
#### 1.15.3.2.2. Type
VARCHAR

#### 1.15.3.2.3. Is Required
True

#### 1.15.3.2.4. Size
50

### 1.15.3.3. userId
#### 1.15.3.3.2. Type
UUID

#### 1.15.3.3.3. Is Required
False

#### 1.15.3.3.4. Is Foreign Key
True

### 1.15.3.4. ipAddress
#### 1.15.3.4.2. Type
VARCHAR

#### 1.15.3.4.3. Is Required
False

#### 1.15.3.4.4. Size
45

### 1.15.3.5. details
#### 1.15.3.5.2. Type
JSON

#### 1.15.3.5.3. Is Required
True

### 1.15.3.6. timestamp
#### 1.15.3.6.2. Type
DateTime

#### 1.15.3.6.3. Is Required
True


### 1.15.4. Primary Keys

- logId

### 1.15.5. Unique Constraints


### 1.15.6. Indexes

### 1.15.6.1. idx_auditlog_timestamp_eventtype
#### 1.15.6.1.2. Columns

- timestamp
- eventType

#### 1.15.6.1.3. Type
BTree




---

# 2. Diagrams

- **Diagram_Title:** Puzzle Game Database Schema  
**Diagram_Area:** Overall Game Database  
**Explanation:** This ER diagram depicts the database schema for a puzzle game. It outlines entities for game elements (Zone, Level, Glyph, Obstacle, PuzzleType), player data (PlayerProfile, UserSettings, LevelProgress, CloudSave), social features (Leaderboard), and monetization (InAppPurchase). Player-owned items are in PlayerInventory, and scores in PlayerScore. System operations are tracked via AuditLog. Relationships show how players progress, manage settings, acquire items, and compete. Key connections include Zone-Level hierarchy and player progression in LevelProgress. Explicit join entities PlayerInventory and PlayerScore facilitate many-to-many links for purchases and leaderboards respectively. Other M-N relationships like Level-Glyph are also shown.  
**Mermaid_Text:** erDiagram
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
  


---

