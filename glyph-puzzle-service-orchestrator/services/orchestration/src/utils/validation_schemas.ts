import Joi from 'joi';

// Schema for IAP receipt data - this is highly dependent on what data is expected
// For example, if it's a raw receipt string from Apple/Google:
export const iapReceiptDataSchema = Joi.object({
  receipt: Joi.string().required(), // The actual receipt string/blob
  // platform: Joi.string().valid('apple', 'google').required(), // If needed from client
  // productId: Joi.string().required(), // If needed for validation context
  // transactionId: Joi.string().optional(), // If needed for validation context
}).unknown(true); // Allow other fields not explicitly defined

export const verifyIapReceiptActivityInputSchema = Joi.object({
  receiptData: Joi.string().required(), // The raw receipt string from the client
  productId: Joi.string().required(),
  transactionId: Joi.string().required(), // Original transaction ID from the client
  platform: Joi.string().valid('ios', 'android').required(), // Or other platform identifiers
});


// Schema for raw score data submission
export const rawScoreDataSchema = Joi.object({
  score: Joi.number().integer().min(0).required(),
  levelId: Joi.string().guid({ version: 'uuidv4' }).required(),
  zoneId: Joi.string().guid({ version: 'uuidv4' }).optional(), // Can be optional depending on game structure
  // Add other relevant score fields, e.g., moves, time, specific puzzle metrics
  // E.g., moves: Joi.number().integer().min(0).optional(),
  // E.g., timeTakenMs: Joi.number().integer().min(0).optional(),
}).unknown(true);

// Schema for gameplay session data, can be complex
// For simplicity, allowing a generic object or string, refine as needed
export const gameplaySessionDataSchema = Joi.alternatives().try(
  Joi.object().unknown(true), // Arbitrary JSON object
  Joi.string() // Or a string (e.g., base64 encoded blob)
).optional().allow(null);


// Schema for Score Workflow Input
export const scoreWorkflowInputSchema = Joi.object({
  playerId: Joi.string().guid({ version: 'uuidv4' }).required(),
  scoreData: rawScoreDataSchema.required(),
  gameplaySessionData: gameplaySessionDataSchema, // Validated by its own schema
  playerContext: Joi.object({ // Contextual info about the player for cheat detection
    // e.g., clientVersion: Joi.string().required(),
    // deviceModel: Joi.string().optional(),
    // ipAddress: Joi.string().ip().optional(), // Might be sourced server-side
  }).unknown(true).optional(),
  clientTimestamp: Joi.date().iso().optional(), // ISO8601 timestamp string from client
});

// Schema for validating score integrity activity input
export const validateScoreIntegrityActivityInputSchema = Joi.object({
    scoreData: rawScoreDataSchema.required(),
    gameplaySessionData: gameplaySessionDataSchema,
});


// General input for IAP workflow
export const iapWorkflowInputSchema = Joi.object({
  playerId: Joi.string().guid({ version: 'uuidv4' }).required(),
  productId: Joi.string().required(),
  transactionId: Joi.string().required(), // Original transaction ID from the client
  receiptData: Joi.string().required(), // The raw receipt string from the client
  platform: Joi.string().valid('ios', 'android').required(), // Or other platform identifiers
  quantity: Joi.number().integer().min(1).default(1),
  priceInCents: Joi.number().integer().min(0).optional(), // For analytics
  currency: Joi.string().length(3).uppercase().optional(), // For analytics, e.g., "USD"
});