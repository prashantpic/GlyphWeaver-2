import Joi from 'joi';

/**
 * Validation schema for the registration request body.
 * Enforces strong password complexity.
 */
export const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('(?=.*[a-z])'))
    .pattern(new RegExp('(?=.*[A-Z])'))
    .pattern(new RegExp('(?=.*[0-9])'))
    .pattern(new RegExp('(?=.*[^A-Za-z0-9])'))
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long.',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    }),
});

/**
 * Validation schema for the login request body.
 */
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

/**
 * Validation schema for the platform linking request body.
 */
export const linkPlatformSchema = Joi.object({
  platform: Joi.string().valid('google-play', 'apple-game-center').required(),
  platformId: Joi.string().required(),
});

/**
 * Validation schema for the token refresh request body.
 */
export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});