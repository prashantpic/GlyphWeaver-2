/**
 * @file Defines shared TypeScript interfaces for activity context data.
 * These interfaces are used to provide common contextual information
 * to Temporal activities, often as part of an activity's input or
 * as a dedicated context object passed to an activity.
 * Namespace: GlyphPuzzle.Orchestration.Activities.Shared
 */

/**
 * Basic context identifying a player.
 * This can be used directly by activities that primarily operate within the scope
 * of a single player or be embedded in more specific context interfaces.
 */
export interface PlayerIdentityContext {
  /**
   * The unique identifier for the player.
   */
  readonly playerId: string;
}

/**
 * Context for activities related to a specific gameplay session.
 * This structure is useful for activities that require both player
 * and session identification, such as cheat detection or session-based analytics.
 *
 * As per REQ-8-014, `runCheatDetectionActivity` would use such context.
 * Example: `{ playerId: "user-123", sessionId: "session-abc-789" }`
 */
export interface GameplayContext extends PlayerIdentityContext {
  /**
   * The unique identifier for the gameplay session.
   */
  readonly sessionId: string;

  /**
   * Optional: Version of the client application.
   * Could be useful for context-dependent logic or debugging.
   */
  // readonly clientVersion?: string;

  /**
   * Optional: Information about the player's device.
   * Could be useful for cheat detection or analytics.
   */
  // readonly deviceInformation?: {
  //   os?: string;
  //   osVersion?: string;
  //   model?: string;
  // };
}

/**
 * Context for activities related to In-App Purchase (IAP) flows.
 * This provides essential identifiers for processing and tracking IAPs.
 *
 * As per REQ-8-013, activities like `grantEntitlementActivity` and
 * `compensateGrantEntitlementActivity` would utilize this context.
 * Example: `{ playerId: "user-123", transactionId: "tx-def-456", productId: "pack_of_gems_01" }`
 */
export interface IAPFlowContext extends PlayerIdentityContext {
  /**
   * The unique identifier for the IAP transaction, often provided by the payment platform
   * or generated internally.
   */
  readonly transactionId: string;

  /**
   * The identifier of the product being purchased.
   */
  readonly productId: string;

  /**
   * Optional: The original transaction ID, relevant for subscription renewals or restorations.
   */
  // readonly originalTransactionId?: string;

  /**
   * Optional: The app store from which the purchase originated.
   * Useful if platform-specific logic is required within an activity.
   */
  // readonly storePlatform?: 'AppleAppStore' | 'GooglePlayStore' | 'Unknown';
}

/**
 * General activity context that could include correlation IDs for tracing
 * requests across multiple services or other cross-cutting concerns.
 */
export interface GenericActivityContext {
  /**
   * A unique identifier used to trace a request or operation across
   * multiple services and components.
   */
  readonly correlationId?: string;

  /**
   * Optional: The user ID of an administrator or system process initiating
   * an action, if applicable.
   */
  // readonly invokingUserId?: string;
}