# Specification

# 1. Database Design

## 1.1. Zone
Represents distinct game zones with progression parameters. Stored as documents in a collection.

### 1.1.3. Attributes

### 1.1.3.1. _id
MongoDB document ID, using UUID string.

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
Condition to unlock this zone (e.g., 'complete_level:uuid', 'iap:sku')

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

- _id

### 1.1.5. Unique Constraints


### 1.1.6. Indexes

### 1.1.6.1. idx_zone_name
#### 1.1.6.1.2. Columns

- name

#### 1.1.6.1.3. Type
Single


## 1.2. Level
Stores level configuration data (handcrafted templates). Embedded arrays store specific glyphs, obstacles, and puzzle types for this level instance. Stored as documents in a collection.

### 1.2.3. Attributes

### 1.2.3.1. _id
MongoDB document ID, using UUID string.

#### 1.2.3.1.2. Type
UUID

#### 1.2.3.1.3. Is Required
True

#### 1.2.3.1.4. Is Primary Key
True

### 1.2.3.2. zoneId
References the Zone document ID.

#### 1.2.3.2.2. Type
UUID

#### 1.2.3.2.3. Is Required
True

#### 1.2.3.2.4. Is Foreign Key
True

### 1.2.3.3. levelNumber
Order within the zone.

#### 1.2.3.3.2. Type
INT

#### 1.2.3.3.3. Is Required
True

### 1.2.3.4. type
Defines if this is a specific handcrafted level or a template for procedural generation.

#### 1.2.3.4.2. Type
VARCHAR

#### 1.2.3.4.3. Is Required
True

#### 1.2.3.4.4. Size
20

#### 1.2.3.4.5. Constraints

- CHECK (type IN ('handcrafted', 'procedural_template'))

### 1.2.3.5. gridSize
Grid dimension (e.g., 3 for 3x3).

#### 1.2.3.5.2. Type
INT

#### 1.2.3.5.3. Is Required
True

### 1.2.3.6. timeLimit
Time limit in seconds (optional).

#### 1.2.3.6.2. Type
INT

#### 1.2.3.6.3. Is Required
False

### 1.2.3.7. moveLimit
Move limit (optional).

#### 1.2.3.7.2. Type
INT

#### 1.2.3.7.3. Is Required
False

### 1.2.3.8. difficultyRating
A rating for this level's difficulty.

#### 1.2.3.8.2. Type
DECIMAL

#### 1.2.3.8.3. Is Required
True

#### 1.2.3.8.4. Precision
3

#### 1.2.3.8.5. Scale
2

### 1.2.3.9. generationSeed
Base seed for procedural generation if this is a template.

#### 1.2.3.9.2. Type
VARCHAR

#### 1.2.3.9.3. Is Required
False

#### 1.2.3.9.4. Size
64

### 1.2.3.10. maxPossibleScore
Calculated maximum attainable score for this level.

#### 1.2.3.10.2. Type
BIGINT

#### 1.2.3.10.3. Is Required
True

### 1.2.3.11. solutionPath
Pre-defined optimal solution path for handcrafted levels (for hints/testing). For procedural templates, this might describe solution properties.

#### 1.2.3.11.2. Type
JSON

#### 1.2.3.11.3. Is Required
False

### 1.2.3.12. glyphs
Embedded array defining glyphs on this level.

#### 1.2.3.12.2. Type
Array of Sub-documents

#### 1.2.3.12.3. Is Required
False

#### 1.2.3.12.5. Attributes

- **Name:** glyphId  
**Type:** UUID  
**Is Required:** True  
**Is Foreign Key:** True  
**Description:** References the Glyph document ID.  
- **Name:** position  
**Type:** JSON  
**Is Required:** True  
**Description:** Grid position (e.g., { x: 1, y: 1 }).  
- **Name:** properties  
**Type:** JSON  
**Is Required:** False  
**Description:** Specific properties for this glyph instance on this level (e.g., sequence number for Sequence Puzzles).  

### 1.2.3.13. obstacles
Embedded array defining obstacles on this level.

#### 1.2.3.13.2. Type
Array of Sub-documents

#### 1.2.3.13.3. Is Required
False

#### 1.2.3.13.5. Attributes

- **Name:** obstacleId  
**Type:** UUID  
**Is Required:** True  
**Is Foreign Key:** True  
**Description:** References the Obstacle document ID.  
- **Name:** position  
**Type:** JSON  
**Is Required:** True  
**Description:** Grid position.  

### 1.2.3.14. puzzleTypes
Embedded array defining puzzle types applicable to this level.

#### 1.2.3.14.2. Type
Array of Sub-documents

#### 1.2.3.14.3. Is Required
False

#### 1.2.3.14.5. Attributes

- **Name:** puzzleTypeId  
**Type:** UUID  
**Is Required:** True  
**Is Foreign Key:** True  
**Description:** References the PuzzleType document ID.  
- **Name:** config  
**Type:** JSON  
**Is Required:** False  
**Description:** Configuration specific to this puzzle type on this level.  

### 1.2.3.15. createdAt
#### 1.2.3.15.2. Type
DateTime

#### 1.2.3.15.3. Is Required
True

### 1.2.3.16. updatedAt
#### 1.2.3.16.2. Type
DateTime

#### 1.2.3.16.3. Is Required
True


### 1.2.4. Primary Keys

- _id

### 1.2.5. Unique Constraints


### 1.2.6. Indexes

### 1.2.6.1. idx_level_zoneid_levelnumber
Index for querying levels within a zone in order.

#### 1.2.6.1.2. Columns

- zoneId
- levelNumber

#### 1.2.6.1.3. Type
Compound

#### 1.2.6.1.4. Order

- 1
- 1

### 1.2.6.2. idx_level_type
#### 1.2.6.2.2. Columns

- type

#### 1.2.6.2.3. Type
Single


## 1.3. ProceduralLevel
Stores instances of procedurally generated level configurations. Stored as documents in a collection.

### 1.3.3. Attributes

### 1.3.3.1. _id
MongoDB document ID, using UUID string.

#### 1.3.3.1.2. Type
UUID

#### 1.3.3.1.3. Is Required
True

#### 1.3.3.1.4. Is Primary Key
True

### 1.3.3.2. baseLevelId
References the Level document ID (template).

#### 1.3.3.2.2. Type
UUID

#### 1.3.3.2.3. Is Required
True

#### 1.3.3.2.4. Is Foreign Key
True

### 1.3.3.3. zoneId
References the Zone document ID this level belongs to.

#### 1.3.3.3.2. Type
UUID

#### 1.3.3.3.3. Is Required
True

#### 1.3.3.3.4. Is Foreign Key
True

### 1.3.3.4. levelNumber
The level number within the zone this generated instance corresponds to.

#### 1.3.3.4.2. Type
INT

#### 1.3.3.4.3. Is Required
True

### 1.3.3.5. generationParameters
Specific parameters and seed used for generation.

#### 1.3.3.5.2. Type
JSON

#### 1.3.3.5.3. Is Required
True

### 1.3.3.6. gridConfig
The generated grid layout, including glyph and obstacle positions, puzzle types configuration, etc.

#### 1.3.3.6.2. Type
JSON

#### 1.3.3.6.3. Is Required
True

### 1.3.3.7. solutionPath
Valid solution path(s) for this generated instance.

#### 1.3.3.7.2. Type
JSON

#### 1.3.3.7.3. Is Required
True

### 1.3.3.8. complexityScore
Calculated complexity of the generated level.

#### 1.3.3.8.2. Type
DECIMAL

#### 1.3.3.8.3. Is Required
True

#### 1.3.3.8.4. Precision
5

#### 1.3.3.8.5. Scale
2

### 1.3.3.9. maxPossibleScore
Calculated maximum attainable score for this generated level instance.

#### 1.3.3.9.2. Type
BIGINT

#### 1.3.3.9.3. Is Required
True

### 1.3.3.10. generatedAt
#### 1.3.3.10.2. Type
DateTime

#### 1.3.3.10.3. Is Required
True


### 1.3.4. Primary Keys

- _id

### 1.3.5. Unique Constraints


### 1.3.6. Indexes

### 1.3.6.1. idx_procedurallevel_baselevelid_generatedat
Index for finding recent generated levels based on a template.

#### 1.3.6.1.2. Columns

- baseLevelId
- generatedAt

#### 1.3.6.1.3. Type
Compound

#### 1.3.6.1.4. Order

- 1
- -1

### 1.3.6.2. idx_procedurallevel_zoneid_levelnumber
Index for querying generated levels by zone and number.

#### 1.3.6.2.2. Columns

- zoneId
- levelNumber

#### 1.3.6.2.3. Type
Compound

#### 1.3.6.2.4. Order

- 1
- 1


## 1.4. PuzzleType
Defines available puzzle mechanics and rules. Stored as documents in a collection.

### 1.4.3. Attributes

### 1.4.3.1. _id
MongoDB document ID, using UUID string.

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

### 1.4.3.3. description
#### 1.4.3.3.2. Type
TEXT

#### 1.4.3.3.3. Is Required
True

### 1.4.3.4. validationRules
Rules and logic for validating paths/solutions for this puzzle type.

#### 1.4.3.4.2. Type
JSON

#### 1.4.3.4.3. Is Required
True


### 1.4.4. Primary Keys

- _id

### 1.4.5. Unique Constraints

### 1.4.5.1. uq_puzzletype_name
#### 1.4.5.1.2. Columns

- name


### 1.4.6. Indexes


## 1.5. Obstacle
Catalog of obstacle types and their properties. Stored as documents in a collection.

### 1.5.3. Attributes

### 1.5.3.1. _id
MongoDB document ID, using UUID string.

#### 1.5.3.1.2. Type
UUID

#### 1.5.3.1.3. Is Required
True

#### 1.5.3.1.4. Is Primary Key
True

### 1.5.3.2. name
#### 1.5.3.2.2. Type
VARCHAR

#### 1.5.3.2.3. Is Required
True

#### 1.5.3.2.4. Size
50

#### 1.5.3.2.5. Is Unique
True

### 1.5.3.3. type
Type of obstacle (including Catalyst treated as an interactive obstacle).

#### 1.5.3.3.2. Type
VARCHAR

#### 1.5.3.3.3. Is Required
True

#### 1.5.3.3.4. Size
20

#### 1.5.3.3.5. Constraints

- CHECK (type IN ('blocker', 'shifting', 'dynamic', 'catalyst'))

### 1.5.3.4. movementPattern
Pattern for shifting tiles (if applicable).

#### 1.5.3.4.2. Type
JSON

#### 1.5.3.4.3. Is Required
False

### 1.5.3.5. interactionRules
Rules for how paths/glyphs interact with this obstacle type.

#### 1.5.3.5.2. Type
JSON

#### 1.5.3.5.3. Is Required
True


### 1.5.4. Primary Keys

- _id

### 1.5.5. Unique Constraints

### 1.5.5.1. uq_obstacle_name
#### 1.5.5.1.2. Columns

- name


### 1.5.6. Indexes


## 1.6. Glyph
Defines glyph types and their behavioral properties. Stored as documents in a collection.

### 1.6.3. Attributes

### 1.6.3.1. _id
MongoDB document ID, using UUID string.

#### 1.6.3.1.2. Type
UUID

#### 1.6.3.1.3. Is Required
True

#### 1.6.3.1.4. Is Primary Key
True

### 1.6.3.2. type
Glyph behavior type.

#### 1.6.3.2.2. Type
VARCHAR

#### 1.6.3.2.3. Is Required
True

#### 1.6.3.2.4. Size
20

#### 1.6.3.2.5. Constraints

- CHECK (type IN ('standard', 'mirror', 'linked', 'catalyst'))

### 1.6.3.3. colorCode
Hex color code (e.g., '#FF0000').

#### 1.6.3.3.2. Type
CHAR

#### 1.6.3.3.3. Is Required
True

#### 1.6.3.3.4. Size
7

### 1.6.3.4. symbol
Text or identifier for the visual symbol.

#### 1.6.3.4.2. Type
VARCHAR

#### 1.6.3.4.3. Is Required
True

#### 1.6.3.4.4. Size
10

### 1.6.3.5. interactionRules
Rules governing path connections and interactions for this glyph type.

#### 1.6.3.5.2. Type
JSON

#### 1.6.3.5.3. Is Required
True

### 1.6.3.6. accessibilityPattern
Identifier for the visual pattern used in colorblind/accessibility modes.

#### 1.6.3.6.2. Type
VARCHAR

#### 1.6.3.6.3. Is Required
True

#### 1.6.3.6.4. Size
20


### 1.6.4. Primary Keys

- _id

### 1.6.5. Unique Constraints


### 1.6.6. Indexes

### 1.6.6.1. idx_glyph_type
#### 1.6.6.1.2. Columns

- type

#### 1.6.6.1.3. Type
Single


## 1.7. Tutorial
Defines available game tutorials and their steps. Stored as documents in a collection.

### 1.7.3. Attributes

### 1.7.3.1. _id
MongoDB document ID, using UUID string.

#### 1.7.3.1.2. Type
UUID

#### 1.7.3.1.3. Is Required
True

#### 1.7.3.1.4. Is Primary Key
True

### 1.7.3.2. name
#### 1.7.3.2.2. Type
VARCHAR

#### 1.7.3.2.3. Is Required
True

#### 1.7.3.2.4. Size
100

### 1.7.3.3. description
#### 1.7.3.3.2. Type
TEXT

#### 1.7.3.3.3. Is Required
True

### 1.7.3.4. keyName
Unique programmatic key for the tutorial (e.g., 'basic_path_drawing').

#### 1.7.3.4.2. Type
VARCHAR

#### 1.7.3.4.3. Is Required
True

#### 1.7.3.4.4. Size
50

#### 1.7.3.4.5. Is Unique
True

### 1.7.3.5. stepDefinitions
Structured definition of tutorial steps, instructions, and required actions.

#### 1.7.3.5.2. Type
JSON

#### 1.7.3.5.3. Is Required
True

### 1.7.3.6. unlockCondition
Condition for this tutorial to become available (e.g., 'complete_level:uuid', 'open_menu').

#### 1.7.3.6.2. Type
VARCHAR

#### 1.7.3.6.3. Is Required
False

#### 1.7.3.6.4. Size
100

### 1.7.3.7. order
Order in which tutorials are typically presented.

#### 1.7.3.7.2. Type
INT

#### 1.7.3.7.3. Is Required
True

### 1.7.3.8. createdAt
#### 1.7.3.8.2. Type
DateTime

#### 1.7.3.8.3. Is Required
True

### 1.7.3.9. updatedAt
#### 1.7.3.9.2. Type
DateTime

#### 1.7.3.9.3. Is Required
True


### 1.7.4. Primary Keys

- _id

### 1.7.5. Unique Constraints

### 1.7.5.1. uq_tutorial_keyname
#### 1.7.5.1.2. Columns

- keyName


### 1.7.6. Indexes

### 1.7.6.1. idx_tutorial_order
#### 1.7.6.1.2. Columns

- order

#### 1.7.6.1.3. Type
Single

#### 1.7.6.1.4. Order

- 1


## 1.8. PlayerProfile
Main player identity and progression tracking. User settings are embedded within this document. Stored as documents in a collection.

### 1.8.3. Attributes

### 1.8.3.1. _id
MongoDB document ID, using UUID string.

#### 1.8.3.1.2. Type
UUID

#### 1.8.3.1.3. Is Required
True

#### 1.8.3.1.4. Is Primary Key
True

### 1.8.3.2. platformId
Platform-specific user ID (Game Center, Google Play Games).

#### 1.8.3.2.2. Type
VARCHAR

#### 1.8.3.2.3. Is Required
False

#### 1.8.3.2.4. Size
255

### 1.8.3.3. username
#### 1.8.3.3.2. Type
VARCHAR

#### 1.8.3.3.3. Is Required
True

#### 1.8.3.3.4. Size
50

#### 1.8.3.3.5. Is Unique
True

### 1.8.3.4. email
Optional email, hashed or encrypted if stored.

#### 1.8.3.4.2. Type
VARCHAR

#### 1.8.3.4.3. Is Required
False

#### 1.8.3.4.4. Size
255

### 1.8.3.5. currentZone
References the Zone document ID the player is currently in or progressed furthest in.

#### 1.8.3.5.2. Type
UUID

#### 1.8.3.5.3. Is Required
False

#### 1.8.3.5.4. Is Foreign Key
True

### 1.8.3.6. totalScore
Denormalized total score. Updated incrementally.

#### 1.8.3.6.2. Type
BIGINT

#### 1.8.3.6.3. Is Required
True

#### 1.8.3.6.4. Default Value
0

### 1.8.3.7. userSettings
Embedded document for player preferences and accessibility settings.

#### 1.8.3.7.2. Type
Sub-document

#### 1.8.3.7.3. Is Required
True

#### 1.8.3.7.5. Attributes

- **Name:** colorblindMode  
**Type:** VARCHAR  
**Is Required:** True  
**Size:** 20  
**Default Value:** 'none'  
- **Name:** textSize  
**Type:** INT  
**Is Required:** True  
**Default Value:** 16  
- **Name:** reducedMotion  
**Type:** BOOLEAN  
**Is Required:** True  
**Default Value:** false  
- **Name:** inputMethod  
**Type:** VARCHAR  
**Is Required:** True  
**Size:** 20  
**Default Value:** 'swipe'  
- **Name:** musicVolume  
**Type:** DECIMAL  
**Is Required:** True  
**Precision:** 3  
**Scale:** 2  
**Default Value:** 1.0  
- **Name:** sfxVolume  
**Type:** DECIMAL  
**Is Required:** True  
**Precision:** 3  
**Scale:** 2  
**Default Value:** 1.0  
- **Name:** locale  
**Type:** VARCHAR  
**Is Required:** True  
**Size:** 10  
**Default Value:** 'en'  
**Description:** Preferred language/locale code (e.g., 'en', 'es-ES').  
- **Name:** marketingConsent  
**Type:** BOOLEAN  
**Is Required:** True  
**Default Value:** true  
**Description:** Consent for marketing communications.  
- **Name:** analyticsConsent  
**Type:** BOOLEAN  
**Is Required:** True  
**Default Value:** true  
**Description:** Consent for non-essential analytics tracking.  
- **Name:** lastUpdated  
**Type:** DateTime  
**Is Required:** True  

### 1.8.3.8. createdAt
#### 1.8.3.8.2. Type
DateTime

#### 1.8.3.8.3. Is Required
True

### 1.8.3.9. lastLogin
#### 1.8.3.9.2. Type
DateTime

#### 1.8.3.9.3. Is Required
False

### 1.8.3.10. isDeleted
Soft delete flag.

#### 1.8.3.10.2. Type
BOOLEAN

#### 1.8.3.10.3. Is Required
True

#### 1.8.3.10.4. Default Value
false


### 1.8.4. Primary Keys

- _id

### 1.8.5. Unique Constraints

### 1.8.5.1. uq_playerprofile_username
#### 1.8.5.1.2. Columns

- username


### 1.8.6. Indexes

### 1.8.6.1. idx_playerprofile_platformid
Index for looking up users by platform ID.

#### 1.8.6.1.2. Columns

- platformId

#### 1.8.6.1.3. Type
Single

#### 1.8.6.1.4. Is Sparse
True

### 1.8.6.2. idx_playerprofile_isdeleted
#### 1.8.6.2.2. Columns

- isDeleted

#### 1.8.6.2.3. Type
Single

### 1.8.6.3. idx_playerprofile_currentzone
#### 1.8.6.3.2. Columns

- currentZone

#### 1.8.6.3.3. Type
Single

#### 1.8.6.3.4. Is Sparse
True


## 1.9. UserTutorialStatus
Tracks a player's progress on specific tutorials. Stored as documents in a collection.

### 1.9.3. Attributes

### 1.9.3.1. _id
MongoDB document ID, using UUID string.

#### 1.9.3.1.2. Type
UUID

#### 1.9.3.1.3. Is Required
True

#### 1.9.3.1.4. Is Primary Key
True

### 1.9.3.2. userId
References the PlayerProfile document ID.

#### 1.9.3.2.2. Type
UUID

#### 1.9.3.2.3. Is Required
True

#### 1.9.3.2.4. Is Foreign Key
True

### 1.9.3.3. tutorialId
References the Tutorial document ID.

#### 1.9.3.3.2. Type
UUID

#### 1.9.3.3.3. Is Required
True

#### 1.9.3.3.4. Is Foreign Key
True

### 1.9.3.4. status
Current status of the tutorial for the user.

#### 1.9.3.4.2. Type
VARCHAR

#### 1.9.3.4.3. Is Required
True

#### 1.9.3.4.4. Size
20

#### 1.9.3.4.5. Constraints

- CHECK (status IN ('unlocked', 'started', 'completed', 'skipped'))

#### 1.9.3.4.6. Default Value
'unlocked'

### 1.9.3.5. lastUpdated
#### 1.9.3.5.2. Type
DateTime

#### 1.9.3.5.3. Is Required
True


### 1.9.4. Primary Keys

- _id

### 1.9.5. Unique Constraints

### 1.9.5.1. uq_usertutorialstatus_userid_tutorialid
#### 1.9.5.1.2. Columns

- userId
- tutorialId


### 1.9.6. Indexes

### 1.9.6.1. idx_usertutorialstatus_userid_tutorialid
Index for finding a user's status for a specific tutorial.

#### 1.9.6.1.2. Columns

- userId
- tutorialId

#### 1.9.6.1.3. Type
Compound

#### 1.9.6.1.4. Order

- 1
- 1


## 1.10. LevelProgress
Tracks player progression through individual levels. Stored as documents in a collection.

### 1.10.3. Attributes

### 1.10.3.1. _id
MongoDB document ID, using UUID string.

#### 1.10.3.1.2. Type
UUID

#### 1.10.3.1.3. Is Required
True

#### 1.10.3.1.4. Is Primary Key
True

### 1.10.3.2. userId
References the PlayerProfile document ID.

#### 1.10.3.2.2. Type
UUID

#### 1.10.3.2.3. Is Required
True

#### 1.10.3.2.4. Is Foreign Key
True

### 1.10.3.3. levelId
References the Level or ProceduralLevel document ID.

#### 1.10.3.3.2. Type
UUID

#### 1.10.3.3.3. Is Required
True

#### 1.10.3.3.4. Is Foreign Key
True

### 1.10.3.4. isProcedural
Indicates if levelId references a ProceduralLevel instance.

#### 1.10.3.4.2. Type
BOOLEAN

#### 1.10.3.4.3. Is Required
True

### 1.10.3.5. starsEarned
#### 1.10.3.5.2. Type
INT

#### 1.10.3.5.3. Is Required
True

#### 1.10.3.5.4. Constraints

- CHECK (starsEarned BETWEEN 0 AND 3)

#### 1.10.3.5.5. Default Value
0

### 1.10.3.6. completionTime
Best completion time in seconds.

#### 1.10.3.6.2. Type
INT

#### 1.10.3.6.3. Is Required
False

### 1.10.3.7. moveCount
Best move count.

#### 1.10.3.7.2. Type
INT

#### 1.10.3.7.3. Is Required
False

### 1.10.3.8. hintsUsed
Total hints used on this level (across attempts).

#### 1.10.3.8.2. Type
INT

#### 1.10.3.8.3. Is Required
True

#### 1.10.3.8.4. Default Value
0

### 1.10.3.9. undosUsed
Total undos used on this level (across attempts).

#### 1.10.3.9.2. Type
INT

#### 1.10.3.9.3. Is Required
True

#### 1.10.3.9.4. Default Value
0

### 1.10.3.10. bestScore
Highest score achieved on this level.

#### 1.10.3.10.2. Type
BIGINT

#### 1.10.3.10.3. Is Required
True

#### 1.10.3.10.4. Default Value
0

### 1.10.3.11. attempts
Total number of attempts for this level.

#### 1.10.3.11.2. Type
INT

#### 1.10.3.11.3. Is Required
True

#### 1.10.3.11.4. Default Value
0

### 1.10.3.12. lastAttempt
#### 1.10.3.12.2. Type
DateTime

#### 1.10.3.12.3. Is Required
True


### 1.10.4. Primary Keys

- _id

### 1.10.5. Unique Constraints

### 1.10.5.1. uq_levelprogress_userid_levelid_isprocedural
#### 1.10.5.1.2. Columns

- userId
- levelId
- isProcedural


### 1.10.6. Indexes

### 1.10.6.1. idx_levelprogress_userid_levelid_isprocedural
Index for finding a user's progress on a specific level (handcrafted or procedural instance).

#### 1.10.6.1.2. Columns

- userId
- levelId
- isProcedural

#### 1.10.6.1.3. Type
Compound

#### 1.10.6.1.4. Order

- 1
- 1
- 1

### 1.10.6.2. idx_levelprogress_levelid_isprocedural
Index for aggregating data per level.

#### 1.10.6.2.2. Columns

- levelId
- isProcedural

#### 1.10.6.2.3. Type
Compound

#### 1.10.6.2.4. Order

- 1
- 1


## 1.11. InAppPurchase
Catalog of available in-app purchase items. Stored as documents in a collection.

### 1.11.3. Attributes

### 1.11.3.1. _id
MongoDB document ID, using UUID string.

#### 1.11.3.1.2. Type
UUID

#### 1.11.3.1.3. Is Required
True

#### 1.11.3.1.4. Is Primary Key
True

### 1.11.3.2. sku
Unique Stock Keeping Unit identifier.

#### 1.11.3.2.2. Type
VARCHAR

#### 1.11.3.2.3. Is Required
True

#### 1.11.3.2.4. Size
50

#### 1.11.3.2.5. Is Unique
True

### 1.11.3.3. name
#### 1.11.3.3.2. Type
VARCHAR

#### 1.11.3.3.3. Is Required
True

#### 1.11.3.3.4. Size
100

### 1.11.3.4. description
#### 1.11.3.4.2. Type
TEXT

#### 1.11.3.4.3. Is Required
False

### 1.11.3.5. type
#### 1.11.3.5.2. Type
VARCHAR

#### 1.11.3.5.3. Is Required
True

#### 1.11.3.5.4. Size
20

#### 1.11.3.5.5. Constraints

- CHECK (type IN ('hint_pack', 'undo_pack', 'cosmetic', 'currency', 'ad_removal', 'level_pack'))

### 1.11.3.6. price
#### 1.11.3.6.2. Type
DECIMAL

#### 1.11.3.6.3. Is Required
True

#### 1.11.3.6.4. Precision
10

#### 1.11.3.6.5. Scale
2

### 1.11.3.7. currencyCode
ISO 4217 currency code (e.g., 'USD').

#### 1.11.3.7.2. Type
CHAR

#### 1.11.3.7.3. Is Required
True

#### 1.11.3.7.4. Size
3

### 1.11.3.8. platformProductId
Product ID used on the specific app store (Apple App Store, Google Play Store).

#### 1.11.3.8.2. Type
VARCHAR

#### 1.11.3.8.3. Is Required
True

#### 1.11.3.8.4. Size
255

### 1.11.3.9. grantedItems
JSON structure defining items/currency granted by this purchase (e.g., [{ type: 'currency', amount: 100 }, { type: 'hints', quantity: 5 }]).

#### 1.11.3.9.2. Type
JSON

#### 1.11.3.9.3. Is Required
True

### 1.11.3.10. isActive
#### 1.11.3.10.2. Type
BOOLEAN

#### 1.11.3.10.3. Is Required
True

#### 1.11.3.10.4. Default Value
true

### 1.11.3.11. createdAt
#### 1.11.3.11.2. Type
DateTime

#### 1.11.3.11.3. Is Required
True

### 1.11.3.12. updatedAt
#### 1.11.3.12.2. Type
DateTime

#### 1.11.3.12.3. Is Required
True


### 1.11.4. Primary Keys

- _id

### 1.11.5. Unique Constraints

### 1.11.5.1. uq_inapppurchase_sku
#### 1.11.5.1.2. Columns

- sku


### 1.11.6. Indexes


## 1.12. IAPTransaction
Records successful in-app purchase transactions for validation and history. Stored as documents in a collection.

### 1.12.3. Attributes

### 1.12.3.1. _id
MongoDB document ID, using UUID string.

#### 1.12.3.1.2. Type
UUID

#### 1.12.3.1.3. Is Required
True

#### 1.12.3.1.4. Is Primary Key
True

### 1.12.3.2. userId
References the PlayerProfile document ID.

#### 1.12.3.2.2. Type
UUID

#### 1.12.3.2.3. Is Required
True

#### 1.12.3.2.4. Is Foreign Key
True

### 1.12.3.3. itemId
References the InAppPurchase document ID.

#### 1.12.3.3.2. Type
UUID

#### 1.12.3.3.3. Is Required
True

#### 1.12.3.3.4. Is Foreign Key
True

### 1.12.3.4. platform
#### 1.12.3.4.2. Type
VARCHAR

#### 1.12.3.4.3. Is Required
True

#### 1.12.3.4.4. Size
20

#### 1.12.3.4.5. Constraints

- CHECK (platform IN ('ios', 'android'))

### 1.12.3.5. platformTransactionId
Unique transaction ID provided by the platform (Apple/Google).

#### 1.12.3.5.2. Type
VARCHAR

#### 1.12.3.5.3. Is Required
True

#### 1.12.3.5.4. Size
255

### 1.12.3.6. receiptData
Original receipt data from the client (may be base64 encoded).

#### 1.12.3.6.2. Type
TEXT

#### 1.12.3.6.3. Is Required
False

### 1.12.3.7. purchaseDate
#### 1.12.3.7.2. Type
DateTime

#### 1.12.3.7.3. Is Required
True

### 1.12.3.8. validationStatus
#### 1.12.3.8.2. Type
VARCHAR

#### 1.12.3.8.3. Is Required
True

#### 1.12.3.8.4. Size
20

#### 1.12.3.8.5. Constraints

- CHECK (validationStatus IN ('pending', 'validated', 'failed', 'refunded'))

#### 1.12.3.8.6. Default Value
'pending'

### 1.12.3.9. validationResponse
Response data received from the platform validation API.

#### 1.12.3.9.2. Type
JSON

#### 1.12.3.9.3. Is Required
False

### 1.12.3.10. itemsGranted
Record of items/currency actually granted for this transaction.

#### 1.12.3.10.2. Type
JSON

#### 1.12.3.10.3. Is Required
False

### 1.12.3.11. createdAt
#### 1.12.3.11.2. Type
DateTime

#### 1.12.3.11.3. Is Required
True

### 1.12.3.12. updatedAt
#### 1.12.3.12.2. Type
DateTime

#### 1.12.3.12.3. Is Required
True


### 1.12.4. Primary Keys

- _id

### 1.12.5. Unique Constraints

### 1.12.5.1. uq_iaptransaction_platform_transactionid
Ensures uniqueness of transactions per platform.

#### 1.12.5.1.2. Columns

- platform
- platformTransactionId


### 1.12.6. Indexes

### 1.12.6.1. idx_iaptransaction_userid
#### 1.12.6.1.2. Columns

- userId

#### 1.12.6.1.3. Type
Single

### 1.12.6.2. idx_iaptransaction_validationstatus
#### 1.12.6.2.2. Columns

- validationStatus

#### 1.12.6.2.3. Type
Single


## 1.13. PlayerInventory
Tracks player-owned consumable items and virtual currency balances. Stored as documents in a collection.

### 1.13.3. Attributes

### 1.13.3.1. _id
MongoDB document ID, using UUID string.

#### 1.13.3.1.2. Type
UUID

#### 1.13.3.1.3. Is Required
True

#### 1.13.3.1.4. Is Primary Key
True

### 1.13.3.2. userId
References the PlayerProfile document ID.

#### 1.13.3.2.2. Type
UUID

#### 1.13.3.2.3. Is Required
True

#### 1.13.3.2.4. Is Foreign Key
True

### 1.13.3.3. type
Type of item/currency.

#### 1.13.3.3.2. Type
VARCHAR

#### 1.13.3.3.3. Is Required
True

#### 1.13.3.3.4. Size
20

#### 1.13.3.3.5. Constraints

- CHECK (type IN ('hints', 'undos', 'currency', 'cosmetic', 'level_pack'))

### 1.13.3.4. keyName
Unique identifier for the specific item/currency (e.g., 'hint_pack_small', 'glyph_orbs', 'cosmetic_theme_ancient').

#### 1.13.3.4.2. Type
VARCHAR

#### 1.13.3.4.3. Is Required
True

#### 1.13.3.4.4. Size
50

### 1.13.3.5. quantity
#### 1.13.3.5.2. Type
INT

#### 1.13.3.5.3. Is Required
True

#### 1.13.3.5.4. Default Value
0

### 1.13.3.6. acquisitionDetails
Optional details about how the item was acquired (e.g., {'source': 'iap', 'transactionId': 'uuid'}, {'source': 'level_reward', 'levelId': 'uuid'}).

#### 1.13.3.6.2. Type
JSON

#### 1.13.3.6.3. Is Required
False

### 1.13.3.7. lastAcquired
#### 1.13.3.7.2. Type
DateTime

#### 1.13.3.7.3. Is Required
True

### 1.13.3.8. createdAt
#### 1.13.3.8.2. Type
DateTime

#### 1.13.3.8.3. Is Required
True

### 1.13.3.9. updatedAt
#### 1.13.3.9.2. Type
DateTime

#### 1.13.3.9.3. Is Required
True


### 1.13.4. Primary Keys

- _id

### 1.13.5. Unique Constraints

### 1.13.5.1. uq_playerinventory_userid_type_keyname
Ensures a user has only one document per unique item type/key name.

#### 1.13.5.1.2. Columns

- userId
- type
- keyName


### 1.13.6. Indexes

### 1.13.6.1. idx_playerinventory_userid
#### 1.13.6.1.2. Columns

- userId

#### 1.13.6.1.3. Type
Single

### 1.13.6.2. idx_playerinventory_type_keyname
Index for querying items by type and key name.

#### 1.13.6.2.2. Columns

- type
- keyName

#### 1.13.6.2.3. Type
Compound

#### 1.13.6.2.4. Order

- 1
- 1


## 1.14. Leaderboard
Defines leaderboard types and configurations. Stored as documents in a collection.

### 1.14.3. Attributes

### 1.14.3.1. _id
MongoDB document ID, using UUID string.

#### 1.14.3.1.2. Type
UUID

#### 1.14.3.1.3. Is Required
True

#### 1.14.3.1.4. Is Primary Key
True

### 1.14.3.2. name
#### 1.14.3.2.2. Type
VARCHAR

#### 1.14.3.2.3. Is Required
True

#### 1.14.3.2.4. Size
100

### 1.14.3.3. keyName
Unique programmatic key for the leaderboard (e.g., 'global_total_score', 'zone1_level10_speed').

#### 1.14.3.3.2. Type
VARCHAR

#### 1.14.3.3.3. Is Required
True

#### 1.14.3.3.4. Size
50

#### 1.14.3.3.5. Is Unique
True

### 1.14.3.4. scope
#### 1.14.3.4.2. Type
VARCHAR

#### 1.14.3.4.3. Is Required
True

#### 1.14.3.4.4. Size
20

#### 1.14.3.4.5. Constraints

- CHECK (scope IN ('global', 'friends', 'event'))

### 1.14.3.5. scoringType
#### 1.14.3.5.2. Type
VARCHAR

#### 1.14.3.5.3. Is Required
True

#### 1.14.3.5.4. Size
20

#### 1.14.3.5.5. Constraints

- CHECK (scoringType IN ('time', 'moves', 'score'))

### 1.14.3.6. associatedLevelId
Optional: References the Level or ProceduralLevel document ID this leaderboard is for.

#### 1.14.3.6.2. Type
UUID

#### 1.14.3.6.3. Is Required
False

#### 1.14.3.6.4. Is Foreign Key
True

### 1.14.3.7. associatedZoneId
Optional: References the Zone document ID this leaderboard is for.

#### 1.14.3.7.2. Type
UUID

#### 1.14.3.7.3. Is Required
False

#### 1.14.3.7.4. Is Foreign Key
True

### 1.14.3.8. refreshInterval
How often the leaderboard is refreshed (e.g., minutes, hours). Relevant for cached views.

#### 1.14.3.8.2. Type
INT

#### 1.14.3.8.3. Is Required
True

### 1.14.3.9. isActive
#### 1.14.3.9.2. Type
BOOLEAN

#### 1.14.3.9.3. Is Required
True

#### 1.14.3.9.4. Default Value
true

### 1.14.3.10. createdAt
#### 1.14.3.10.2. Type
DateTime

#### 1.14.3.10.3. Is Required
True

### 1.14.3.11. updatedAt
#### 1.14.3.11.2. Type
DateTime

#### 1.14.3.11.3. Is Required
True


### 1.14.4. Primary Keys

- _id

### 1.14.5. Unique Constraints

### 1.14.5.1. uq_leaderboard_keyname
#### 1.14.5.1.2. Columns

- keyName


### 1.14.6. Indexes

### 1.14.6.1. idx_leaderboard_keyname
#### 1.14.6.1.2. Columns

- keyName

#### 1.14.6.1.3. Type
Single


## 1.15. PlayerScore
Records player scores submitted for leaderboard participation. Stored as documents in a collection. Optimization: Indexing and potentially using MongoDB Time Series collections (if performance needs arise for time-based score aggregations) or Sharding for massive data.

### 1.15.3. Attributes

### 1.15.3.1. _id
MongoDB document ID, using UUID string.

#### 1.15.3.1.2. Type
UUID

#### 1.15.3.1.3. Is Required
True

#### 1.15.3.1.4. Is Primary Key
True

### 1.15.3.2. userId
References the PlayerProfile document ID.

#### 1.15.3.2.2. Type
UUID

#### 1.15.3.2.3. Is Required
True

#### 1.15.3.2.4. Is Foreign Key
True

### 1.15.3.3. leaderboardId
References the Leaderboard document ID.

#### 1.15.3.3.2. Type
UUID

#### 1.15.3.3.3. Is Required
True

#### 1.15.3.3.4. Is Foreign Key
True

### 1.15.3.4. scoreValue
#### 1.15.3.4.2. Type
BIGINT

#### 1.15.3.4.3. Is Required
True

### 1.15.3.5. metadata
Optional metadata relevant for tie-breaking or display (e.g., completionTime, moveCount).

#### 1.15.3.5.2. Type
JSON

#### 1.15.3.5.3. Is Required
False

### 1.15.3.6. timestamp
#### 1.15.3.6.2. Type
DateTime

#### 1.15.3.6.3. Is Required
True

### 1.15.3.7. validationHash
Hash or signature for server-side score validation.

#### 1.15.3.7.2. Type
VARCHAR

#### 1.15.3.7.3. Is Required
True

#### 1.15.3.7.4. Size
64

### 1.15.3.8. isValid
Indicates if the score passed server-side validation.

#### 1.15.3.8.2. Type
BOOLEAN

#### 1.15.3.8.3. Is Required
True

#### 1.15.3.8.4. Default Value
false

### 1.15.3.9. validationDetails
Details about the validation process (e.g., reasons for failure).

#### 1.15.3.9.2. Type
JSON

#### 1.15.3.9.3. Is Required
False


### 1.15.4. Primary Keys

- _id

### 1.15.5. Unique Constraints


### 1.15.6. Indexes

### 1.15.6.1. idx_playerscore_leaderboardid_scorevalue_timestamp
Index for ranking scores on a leaderboard (score descending, timestamp ascending for tie-breaking).

#### 1.15.6.1.2. Columns

- leaderboardId
- scoreValue
- timestamp

#### 1.15.6.1.3. Type
Compound

#### 1.15.6.1.4. Order

- 1
- -1
- 1

### 1.15.6.2. idx_playerscore_userid_leaderboardid
Index for finding a user's best score on a specific leaderboard.

#### 1.15.6.2.2. Columns

- userId
- leaderboardId

#### 1.15.6.2.3. Type
Compound

#### 1.15.6.2.4. Order

- 1
- 1

### 1.15.6.3. idx_playerscore_timestamp
#### 1.15.6.3.2. Columns

- timestamp

#### 1.15.6.3.3. Type
Single

### 1.15.6.4. idx_playerscore_isvalid
#### 1.15.6.4.2. Columns

- isValid

#### 1.15.6.4.3. Type
Single


## 1.16. Achievement
Catalog of available achievements. Stored as documents in a collection.

### 1.16.3. Attributes

### 1.16.3.1. _id
MongoDB document ID, using UUID string.

#### 1.16.3.1.2. Type
UUID

#### 1.16.3.1.3. Is Required
True

#### 1.16.3.1.4. Is Primary Key
True

### 1.16.3.2. name
#### 1.16.3.2.2. Type
VARCHAR

#### 1.16.3.2.3. Is Required
True

#### 1.16.3.2.4. Size
100

### 1.16.3.3. keyName
Unique programmatic key for the achievement (e.g., 'complete_zone1', 'use_100_hints').

#### 1.16.3.3.2. Type
VARCHAR

#### 1.16.3.3.3. Is Required
True

#### 1.16.3.3.4. Size
50

#### 1.16.3.3.5. Is Unique
True

### 1.16.3.4. description
#### 1.16.3.4.2. Type
TEXT

#### 1.16.3.4.3. Is Required
True

### 1.16.3.5. unlockCriteria
Structured definition of how the achievement is unlocked (e.g., {'type': 'level_completion', 'levelId': 'uuid'}, {'type': 'collect_total_currency', 'currencyType': 'glyph_orbs', 'amount': 1000}).

#### 1.16.3.5.2. Type
JSON

#### 1.16.3.5.3. Is Required
True

### 1.16.3.6. isIncremental
True if this is an incremental achievement with steps.

#### 1.16.3.6.2. Type
BOOLEAN

#### 1.16.3.6.3. Is Required
True

#### 1.16.3.6.4. Default Value
false

### 1.16.3.7. totalSteps
Total steps for incremental achievements.

#### 1.16.3.7.2. Type
INT

#### 1.16.3.7.3. Is Required
False

### 1.16.3.8. platformId
Platform-specific achievement ID (Game Center, Google Play Games).

#### 1.16.3.8.2. Type
VARCHAR

#### 1.16.3.8.3. Is Required
False

#### 1.16.3.8.4. Size
255

### 1.16.3.9. points
Optional points awarded (e.g., for Game Center/Google Play Games).

#### 1.16.3.9.2. Type
INT

#### 1.16.3.9.3. Is Required
False

### 1.16.3.10. iconAsset
Path or identifier for the achievement icon asset.

#### 1.16.3.10.2. Type
VARCHAR

#### 1.16.3.10.3. Is Required
False

#### 1.16.3.10.4. Size
255

### 1.16.3.11. createdAt
#### 1.16.3.11.2. Type
DateTime

#### 1.16.3.11.3. Is Required
True

### 1.16.3.12. updatedAt
#### 1.16.3.12.2. Type
DateTime

#### 1.16.3.12.3. Is Required
True


### 1.16.4. Primary Keys

- _id

### 1.16.5. Unique Constraints

### 1.16.5.1. uq_achievement_keyname
#### 1.16.5.1.2. Columns

- keyName


### 1.16.6. Indexes

### 1.16.6.1. idx_achievement_keyname
#### 1.16.6.1.2. Columns

- keyName

#### 1.16.6.1.3. Type
Single

### 1.16.6.2. idx_achievement_platformid
#### 1.16.6.2.2. Columns

- platformId

#### 1.16.6.2.3. Type
Single

#### 1.16.6.2.4. Is Sparse
True


## 1.17. PlayerAchievement
Tracks a player's status on specific achievements. Stored as documents in a collection.

### 1.17.3. Attributes

### 1.17.3.1. _id
MongoDB document ID, using UUID string.

#### 1.17.3.1.2. Type
UUID

#### 1.17.3.1.3. Is Required
True

#### 1.17.3.1.4. Is Primary Key
True

### 1.17.3.2. userId
References the PlayerProfile document ID.

#### 1.17.3.2.2. Type
UUID

#### 1.17.3.2.3. Is Required
True

#### 1.17.3.2.4. Is Foreign Key
True

### 1.17.3.3. achievementId
References the Achievement document ID.

#### 1.17.3.3.2. Type
UUID

#### 1.17.3.3.3. Is Required
True

#### 1.17.3.3.4. Is Foreign Key
True

### 1.17.3.4. unlockedAt
Timestamp when the achievement was unlocked (null if not unlocked).

#### 1.17.3.4.2. Type
DateTime

#### 1.17.3.4.3. Is Required
False

### 1.17.3.5. progress
Current progress for incremental achievements (e.g., { currentSteps: 5 }).

#### 1.17.3.5.2. Type
JSON

#### 1.17.3.5.3. Is Required
False

### 1.17.3.6. isPlatformSynced
True if the achievement status has been synced with the platform's achievement service.

#### 1.17.3.6.2. Type
BOOLEAN

#### 1.17.3.6.3. Is Required
True

#### 1.17.3.6.4. Default Value
false

### 1.17.3.7. createdAt
#### 1.17.3.7.2. Type
DateTime

#### 1.17.3.7.3. Is Required
True

### 1.17.3.8. updatedAt
#### 1.17.3.8.2. Type
DateTime

#### 1.17.3.8.3. Is Required
True


### 1.17.4. Primary Keys

- _id

### 1.17.5. Unique Constraints

### 1.17.5.1. uq_playerachievement_userid_achievementid
#### 1.17.5.1.2. Columns

- userId
- achievementId


### 1.17.6. Indexes

### 1.17.6.1. idx_playerachievement_userid_achievementid
Index for finding a user's status for a specific achievement.

#### 1.17.6.1.2. Columns

- userId
- achievementId

#### 1.17.6.1.3. Type
Compound

#### 1.17.6.1.4. Order

- 1
- 1

### 1.17.6.2. idx_playerachievement_unlockedat
#### 1.17.6.2.2. Columns

- unlockedAt

#### 1.17.6.2.3. Type
Single

#### 1.17.6.2.4. Is Sparse
True


## 1.18. CloudSave
Stores cloud-synced player progression data using platform services. Stored as documents in a collection.

### 1.18.3. Attributes

### 1.18.3.1. _id
MongoDB document ID, using UUID string.

#### 1.18.3.1.2. Type
UUID

#### 1.18.3.1.3. Is Required
True

#### 1.18.3.1.4. Is Primary Key
True

### 1.18.3.2. userId
References the PlayerProfile document ID.

#### 1.18.3.2.2. Type
UUID

#### 1.18.3.2.3. Is Required
True

#### 1.18.3.2.4. Is Foreign Key
True

### 1.18.3.3. platform
Platform identifier (e.g., 'ios' for iCloud, 'android' for Google Play Games, 'custom' for game's own cloud save if implemented).

#### 1.18.3.3.2. Type
VARCHAR

#### 1.18.3.3.3. Is Required
True

#### 1.18.3.3.4. Size
20

#### 1.18.3.3.5. Constraints

- CHECK (platform IN ('ios', 'android', 'custom'))

### 1.18.3.4. saveData
The serialized player save data blob.

#### 1.18.3.4.2. Type
JSON

#### 1.18.3.4.3. Is Required
True

### 1.18.3.5. version
Version of the save data schema.

#### 1.18.3.5.2. Type
INT

#### 1.18.3.5.3. Is Required
True

### 1.18.3.6. lastSynced
#### 1.18.3.6.2. Type
DateTime

#### 1.18.3.6.3. Is Required
True

### 1.18.3.7. createdAt
#### 1.18.3.7.2. Type
DateTime

#### 1.18.3.7.3. Is Required
True

### 1.18.3.8. updatedAt
#### 1.18.3.8.2. Type
DateTime

#### 1.18.3.8.3. Is Required
True


### 1.18.4. Primary Keys

- _id

### 1.18.5. Unique Constraints

### 1.18.5.1. uq_cloudsave_userid_platform
Ensures only one cloud save document per user per platform.

#### 1.18.5.1.2. Columns

- userId
- platform


### 1.18.6. Indexes

### 1.18.6.1. idx_cloudsave_userid_platform
Index for retrieving a user's cloud save for a specific platform.

#### 1.18.6.1.2. Columns

- userId
- platform

#### 1.18.6.1.3. Type
Compound

#### 1.18.6.1.4. Order

- 1
- 1

### 1.18.6.2. idx_cloudsave_lastsynced
#### 1.18.6.2.2. Columns

- lastSynced

#### 1.18.6.2.3. Type
Single

#### 1.18.6.2.4. Order

- -1


## 1.19. GameConfiguration
Stores system-wide game configuration settings. Can be a single document or multiple based on key. Stored as documents in a collection.

### 1.19.3. Attributes

### 1.19.3.1. _id
MongoDB document ID, using UUID string.

#### 1.19.3.1.2. Type
UUID

#### 1.19.3.1.3. Is Required
True

#### 1.19.3.1.4. Is Primary Key
True

### 1.19.3.2. key
Unique key for the configuration setting (e.g., 'feature_flags', 'event_settings').

#### 1.19.3.2.2. Type
VARCHAR

#### 1.19.3.2.3. Is Required
True

#### 1.19.3.2.4. Size
50

#### 1.19.3.2.5. Is Unique
True

### 1.19.3.3. value
The configuration data as a JSON object.

#### 1.19.3.3.2. Type
JSON

#### 1.19.3.3.3. Is Required
True

### 1.19.3.4. lastUpdatedBy
Identifier of the user or process that last updated the configuration.

#### 1.19.3.4.2. Type
VARCHAR

#### 1.19.3.4.3. Is Required
False

#### 1.19.3.4.4. Size
100

### 1.19.3.5. createdAt
#### 1.19.3.5.2. Type
DateTime

#### 1.19.3.5.3. Is Required
True

### 1.19.3.6. updatedAt
#### 1.19.3.6.2. Type
DateTime

#### 1.19.3.6.3. Is Required
True


### 1.19.4. Primary Keys

- _id

### 1.19.5. Unique Constraints

### 1.19.5.1. uq_gameconfiguration_key
#### 1.19.5.1.2. Columns

- key


### 1.19.6. Indexes


## 1.20. AuditLog
Tracks system events for security, debugging, and compliance. Stored as documents in a collection. Can utilize MongoDB Time Series Collections for optimized storage and querying of time-stamped data.

### 1.20.3. Attributes

### 1.20.3.1. _id
MongoDB document ID, using UUID string.

#### 1.20.3.1.2. Type
UUID

#### 1.20.3.1.3. Is Required
True

#### 1.20.3.1.4. Is Primary Key
True

### 1.20.3.2. eventType
Type of event (e.g., 'score_submission', 'iap_validation_success', 'login_failed', 'config_update').

#### 1.20.3.2.2. Type
VARCHAR

#### 1.20.3.2.3. Is Required
True

#### 1.20.3.2.4. Size
50

### 1.20.3.3. userId
References the PlayerProfile document ID if the event is user-related (nullable).

#### 1.20.3.3.2. Type
UUID

#### 1.20.3.3.3. Is Required
False

#### 1.20.3.3.4. Is Foreign Key
True

### 1.20.3.4. ipAddress
IP address associated with the event.

#### 1.20.3.4.2. Type
VARCHAR

#### 1.20.3.4.3. Is Required
False

#### 1.20.3.4.4. Size
45

### 1.20.3.5. details
JSON object containing event-specific details (e.g., score value, item SKU, level ID, old/new config values).

#### 1.20.3.5.2. Type
JSON

#### 1.20.3.5.3. Is Required
True

### 1.20.3.6. timestamp
#### 1.20.3.6.2. Type
DateTime

#### 1.20.3.6.3. Is Required
True


### 1.20.4. Primary Keys

- _id

### 1.20.5. Unique Constraints


### 1.20.6. Indexes

### 1.20.6.1. idx_auditlog_timestamp_eventtype
Index for querying logs by time and event type.

#### 1.20.6.1.2. Columns

- timestamp
- eventType

#### 1.20.6.1.3. Type
Compound

#### 1.20.6.1.4. Order

- -1
- 1

### 1.20.6.2. idx_auditlog_userid_timestamp
Index for finding logs related to a specific user by time.

#### 1.20.6.2.2. Columns

- userId
- timestamp

#### 1.20.6.2.3. Type
Compound

#### 1.20.6.2.4. Order

- 1
- -1




---

# 2. Diagrams

- **Diagram_Title:** Glyph Weaver Core Database ER Diagram  
**Diagram_Area:** Overall Database Structure  
**Explanation:** This diagram shows the main entities and their relationships in the Glyph Weaver Core Database. Key entities like PlayerProfile, Zone, Level, and their associated data (progress, inventory, scores, achievements) are represented. Catalog data (Glyph, Obstacle, PuzzleType, Tutorial, InAppPurchase, Achievement) and system logs/config are also included. Relationships are depicted with cardinality notation (one-to-one, one-to-many) and foreign key references where applicable.  
**Mermaid_Text:** erDiagram
    Zone {
        UUID _id PK
        VARCHAR name
    }
    Level {
        UUID _id PK
        UUID zoneId FK
        INT levelNumber
        VARCHAR type
    }
    ProceduralLevel {
        UUID _id PK
        UUID baseLevelId FK
        UUID zoneId FK
        INT levelNumber
    }
    PuzzleType {
        UUID _id PK
        VARCHAR name
    }
    Obstacle {
        UUID _id PK
        VARCHAR name
    }
    Glyph {
        UUID _id PK
        VARCHAR type
    }
    Tutorial {
        UUID _id PK
        VARCHAR keyName
    }
    PlayerProfile {
        UUID _id PK
        VARCHAR username
        UUID currentZone FK
    }
    UserTutorialStatus {
        UUID _id PK
        UUID userId FK
        UUID tutorialId FK
    }
    LevelProgress {
        UUID _id PK
        UUID userId FK
        UUID levelId FK
        BOOLEAN isProcedural
    }
    InAppPurchase {
        UUID _id PK
        VARCHAR sku
    }
    IAPTransaction {
        UUID _id PK
        UUID userId FK
        UUID itemId FK
    }
    PlayerInventory {
        UUID _id PK
        UUID userId FK
        VARCHAR type
        VARCHAR keyName
    }
    Leaderboard {
        UUID _id PK
        VARCHAR keyName
        UUID associatedLevelId FK
        UUID associatedZoneId FK
    }
    PlayerScore {
        UUID _id PK
        UUID userId FK
        UUID leaderboardId FK
    }
    Achievement {
        UUID _id PK
        VARCHAR keyName
    }
    PlayerAchievement {
        UUID _id PK
        UUID userId FK
        UUID achievementId FK
    }
    CloudSave {
        UUID _id PK
        UUID userId FK
        VARCHAR platform
    }
    GameConfiguration {
        UUID _id PK
        VARCHAR key
    }
    AuditLog {
        UUID _id PK
        VARCHAR eventType
        UUID userId FK
        DateTime timestamp
    }

    Zone }|--|| Level : contains
    Zone }|--|| ProceduralLevel : contains
    Zone }|--o{ PlayerProfile : currently_in
    Zone }|--o{ Leaderboard : associated_with
    Level }|--|| ProceduralLevel : template_for
    Level }|--o{ LevelProgress : tracks_progress
    Level }|--o| Leaderboard : associated_with
    ProceduralLevel }|--o{ LevelProgress : tracks_progress
    ProceduralLevel }|--o| Leaderboard : associated_with

    PuzzleType }|--o{ Level : used_in
    Obstacle }|--o{ Level : used_in
    Glyph }|--o{ Level : used_in

    PlayerProfile ||--|{ UserTutorialStatus : tracks_status_for
    PlayerProfile ||--|{ LevelProgress : has_progress_on
    PlayerProfile ||--|{ IAPTransaction : made
    PlayerProfile ||--|{ PlayerInventory : owns
    PlayerProfile ||--|{ PlayerScore : submitted
    PlayerProfile ||--|{ PlayerAchievement : tracks_status_for
    PlayerProfile ||--|{ CloudSave : has_save_on
    PlayerProfile ||--o{ AuditLog : generated_log

    Tutorial }|--|{ UserTutorialStatus : has_status_for

    InAppPurchase }|--|{ IAPTransaction : purchased_item

    Leaderboard }|--|{ PlayerScore : has_score_on

    Achievement }|--|{ PlayerAchievement : has_status_for
  


---

