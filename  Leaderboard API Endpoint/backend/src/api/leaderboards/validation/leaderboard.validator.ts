/**
 * @file Contains Joi validation schemas for validating incoming API requests for the leaderboard endpoints.
 * @description This file provides schemas for validating the structure and content of leaderboard-related API requests,
 * ensuring data integrity before it's processed by the service layer.
 * @namespace GlyphWeaver.Backend.Api.Leaderboards.Validation
 */

import Joi from 'joi';

/**
 * Joi schema for validating the body of a score submission request.
 * It ensures that all required fields are present, have the correct type, and fall within expected ranges.
 */
export const submitScoreSchema: Joi.ObjectSchema = Joi.object({
  score: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'Score must be a number.',
      'number.integer': 'Score must be an integer.',
      'number.min': 'Score must be a positive number.',
      'any.required': 'Score is required.',
    }),

  completionTime: Joi.number().integer().min(0).required()
    .messages({
      'number.base': 'Completion time must be a number.',
      'number.integer': 'Completion time must be an integer.',
      'number.min': 'Completion time must be a positive number.',
      'any.required': 'Completion time is required.',
    }),

  moves: Joi.number().integer().min(1).required()
    .messages({
      'number.base': 'Moves must be a number.',
      'number.integer': 'Moves must be an integer.',
      'number.min': 'Moves must be at least 1.',
      'any.required': 'Moves are required.',
    }),

  validationHash: Joi.string().hex().length(64).required()
    .messages({
      'string.base': 'Validation hash must be a string.',
      'string.hex': 'Validation hash must be a hexadecimal string.',
      'string.length': 'Validation hash must be 64 characters long (SHA-256).',
      'any.required': 'Validation hash is required.',
    }),
});