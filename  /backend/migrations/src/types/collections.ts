import { ObjectId } from 'mongodb';

// A generic position on the grid
export interface IGridPosition {
  x: number;
  y: number;
}

// --- Catalog Collections ---

export interface IZone {
  _id: ObjectId;
  name: string;
  description?: string;
  unlockCondition: string;
  gridMinSize: number;
  gridMaxSize: number;
  maxGlyphTypes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILevelGlyph {
  glyphId: ObjectId;
  position: IGridPosition;
  properties?: Record<string, any>;
}

export interface ILevelObstacle {
  obstacleId: ObjectId;
  position: IGridPosition;
}

export interface ILevelPuzzleType {
  puzzleTypeId: ObjectId;
  config?: Record<string, any>;
}

export interface ILevel {
  _id: ObjectId;
  zoneId: ObjectId;
  levelNumber: number;
  type: 'handcrafted' | 'procedural_template';
  gridSize: number;
  timeLimit?: number;
  moveLimit?: number;
  difficultyRating: number;
  generationSeed?: string;
  maxPossibleScore: number;
  solutionPath?: Record<string, any>;
  glyphs?: ILevelGlyph[];
  obstacles?: ILevelObstacle[];
  puzzleTypes?: ILevelPuzzleType[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProceduralLevel {
  _id: ObjectId;
  baseLevelId: ObjectId;
  zoneId: ObjectId;
  levelNumber: number;
  generationParameters: Record<string, any>;
  gridConfig: Record<string, any>;
  solutionPath: Record<string, any>;
  complexityScore: number;
  maxPossibleScore: number;
  generatedAt: Date;
}

export interface IPuzzleType {
  _id: ObjectId;
  name: string;
  description: string;
  validationRules: Record<string, any>;
}

export interface IObstacle {
  _id: ObjectId;
  name: string;
  type: 'blocker' | 'shifting' | 'dynamic' | 'catalyst';
  movementPattern?: Record<string, any>;
  interactionRules: Record<string, any>;
}

export interface IGlyph {
  _id: ObjectId;
  type: 'standard' | 'mirror' | 'linked' | 'catalyst';
  colorCode: string;
  symbol: string;
  interactionRules: Record<string, any>;
  accessibilityPattern: string;
}

export interface ITutorial {
  _id: ObjectId;
  name: string;
  description: string;
  keyName: string;
  stepDefinitions: Record<string, any>;
  unlockCondition?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IInAppPurchase {
  _id: ObjectId;
  sku: string;
  name: string;
  description?: string;
  type: 'hint_pack' | 'undo_pack' | 'cosmetic' | 'currency' | 'ad_removal' | 'level_pack';
  price: number;
  currencyCode: string;
  platformProductId: string;
  grantedItems: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAchievement {
  _id: ObjectId;
  name: string;
  keyName: string;
  description: string;
  unlockCriteria: Record<string, any>;
  isIncremental: boolean;
  totalSteps?: number;
  platformId?: string;
  points?: number;
  iconAsset?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILeaderboard {
  _id: ObjectId;
  name: string;
  keyName: string;
  scope: 'global' | 'friends' | 'event';
  scoringType: 'time' | 'moves' | 'score';
  associatedLevelId?: ObjectId;
  associatedZoneId?: ObjectId;
  refreshInterval: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// --- Player-Related Collections ---

export interface IUserSettings {
  colorblindMode: string;
  textSize: number;
  reducedMotion: boolean;
  inputMethod: string;
  musicVolume: number;
  sfxVolume: number;
  locale: string;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  lastUpdated: Date;
}

export interface IPlayerProfile {
  _id: ObjectId;
  platformId?: string;
  username: string;
  email?: string;
  currentZone?: ObjectId;
  totalScore: number;
  userSettings: IUserSettings;
  createdAt: Date;
  lastLogin?: Date;
  isDeleted: boolean;
}

export interface IUserTutorialStatus {
  _id: ObjectId;
  userId: ObjectId;
  tutorialId: ObjectId;
  status: 'unlocked' | 'started' | 'completed' | 'skipped';
  lastUpdated: Date;
}

export interface ILevelProgress {
  _id: ObjectId;
  userId: ObjectId;
  levelId: ObjectId;
  isProcedural: boolean;
  starsEarned: number;
  completionTime?: number;
  moveCount?: number;
  hintsUsed: number;
  undosUsed: number;
  bestScore: number;
  attempts: number;
  lastAttempt: Date;
}

export interface IIAPTransaction {
  _id: ObjectId;
  userId: ObjectId;
  itemId: ObjectId;
  platform: 'ios' | 'android';
  platformTransactionId: string;
  receiptData?: string;
  purchaseDate: Date;
  validationStatus: 'pending' | 'validated' | 'failed' | 'refunded';
  validationResponse?: Record<string, any>;
  itemsGranted?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayerInventory {
  _id: ObjectId;
  userId: ObjectId;
  type: 'hints' | 'undos' | 'currency' | 'cosmetic' | 'level_pack';
  keyName: string;
  quantity: number;
  acquisitionDetails?: Record<string, any>;
  lastAcquired: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayerScore {
  _id: ObjectId;
  userId: ObjectId;
  leaderboardId: ObjectId;
  scoreValue: number;
  metadata?: Record<string, any>;
  timestamp: Date;
  validationHash: string;
  isValid: boolean;
  validationDetails?: Record<string, any>;
}

export interface IPlayerAchievement {
  _id: ObjectId;
  userId: ObjectId;
  achievementId: ObjectId;
  unlockedAt?: Date;
  progress?: Record<string, any>;
  isPlatformSynced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICloudSave {
  _id: ObjectId;
  userId: ObjectId;
  platform: 'ios' | 'android' | 'custom';
  saveData: Record<string, any>;
  version: number;
  lastSynced: Date;
  createdAt: Date;
  updatedAt: Date;
}


// --- System Collections ---

export interface IGameConfiguration {
  _id: ObjectId;
  key: string;
  value: Record<string, any>;
  lastUpdatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuditLog {
  _id: ObjectId;
  eventType: string;
  userId?: ObjectId;
  ipAddress?: string;
  details: Record<string, any>;
  timestamp: Date;
}