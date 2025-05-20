export const DEFAULT_PAGINATION_LIMIT = 10;
export const MAX_PAGINATION_LIMIT = 100;

export const CACHE_TTL_SECONDS_SHORT = 60; // 1 minute
export const CACHE_TTL_SECONDS_MEDIUM = 300; // 5 minutes
export const CACHE_TTL_SECONDS_LONG = 3600; // 1 hour

export const JWT_COOKIE_NAME = 'jwt_refresh_token';

// HTTP Status Codes (subset, add as needed)
export const HTTP_STATUS_OK = 200;
export const HTTP_STATUS_CREATED = 201;
export const HTTP_STATUS_NO_CONTENT = 204;
export const HTTP_STATUS_BAD_REQUEST = 400;
export const HTTP_STATUS_UNAUTHORIZED = 401;
export const HTTP_STATUS_FORBIDDEN = 403;
export const HTTP_STATUS_NOT_FOUND = 404;
export const HTTP_STATUS_CONFLICT = 409;
export const HTTP_STATUS_UNPROCESSABLE_ENTITY = 422;
export const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

// Roles (example)
export const USER_ROLE = 'user';
export const ADMIN_ROLE = 'admin';

// IAP Platforms
export const IAP_PLATFORM_APPLE = 'apple';
export const IAP_PLATFORM_GOOGLE = 'google';

// Procedural Level Outcome
export const LEVEL_OUTCOME_WIN = 'win';
export const LEVEL_OUTCOME_LOSS = 'loss';

// Leaderboard Time Scopes
export const LEADERBOARD_SCOPE_DAILY = 'daily';
export const LEADERBOARD_SCOPE_WEEKLY = 'weekly';
export const LEADERBOARD_SCOPE_ALL_TIME = 'all';