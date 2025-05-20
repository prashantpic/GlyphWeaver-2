/**
 * @file Defines the standard structure for error responses from the API Gateway.
 * This DTO ensures consistency in error reporting to clients and aligns with
 * the OpenAPI specification for error responses.
 */

export interface ErrorResponseDto {
  /**
   * HTTP status code.
   * This should align with standard HTTP status codes (e.g., 400, 401, 403, 404, 500).
   * @example 400
   */
  readonly statusCode: number;

  /**
   * A general, human-readable message describing the error.
   * This message should be suitable for display to end-users for client-side errors (4xx),
   * and generic for server-side errors (5xx) to avoid leaking sensitive information.
   * @example "Invalid request payload."
   * @example "An unexpected error occurred. Please try again later."
   */
  readonly message: string;

  /**
   * An optional, specific application or business error code.
   * This can be used by clients for more granular error handling or localization.
   * @example "VALIDATION_ERROR"
   * @example "INSUFFICIENT_FUNDS"
   */
  readonly errorCode?: string;

  /**
   * An ISO 8601 timestamp indicating when the error occurred on the server.
   * @example "2023-10-26T10:00:00Z"
   */
  readonly timestamp: string;

  /**
   * The request path (URL path) that resulted in this error.
   * This helps in diagnosing issues by identifying the specific endpoint.
   * @example "/v1/player/score"
   */
  readonly path: string;

  /**
   * Optional. Provides more detailed information about the error.
   * This can be an object containing specific error fields or an array of error objects,
   * particularly useful for validation errors where multiple issues might be present.
   * The structure of `details` can vary depending on the `errorCode`.
   * @example { "field": "email", "issue": "must be a valid email address" }
   * @example [{ "field": "username", "issue": "already exists" }, { "field": "password", "issue": "too short" }]
   */
  readonly details?: Record<string, any> | Array<Record<string, any>>;
}