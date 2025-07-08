import Joi from 'joi';

/**
 * Joi validation schema for the request body of the 'register procedural level' endpoint.
 * This schema ensures that incoming data is well-formed and meets all requirements
 * before being processed by the controller and service layers.
 */
export const registerLevelSchema = Joi.object({
  /**
   * Must be a non-empty string.
   */
  baseLevelId: Joi.string().required(),

  /**
   * Must be a non-empty string.
   */
  generationSeed: Joi.string().required(),

  /**
   * Must be an object, cannot be empty.
   */
  generationParameters: Joi.object().required(),

  /**
   * Must be an object, cannot be empty.
   */
  solutionPath: Joi.object().required(),

  /**
   * Must be a number.
   */
  complexityScore: Joi.number().required(),
});