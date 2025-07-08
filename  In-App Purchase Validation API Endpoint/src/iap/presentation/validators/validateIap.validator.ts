import Joi from 'joi';

/**
 * @const validateIapValidator
 * @description A Joi schema for validating the incoming request body of the IAP validation endpoint.
 * It enforces data integrity and structure, preventing malformed requests from reaching the application logic.
 * It features conditional validation for `receiptData` based on the `platform` field.
 */
export const validateIapValidator = Joi.object({
  /**
   * 'platform' must be a required string and must be either 'ios' or 'android'.
   */
  platform: Joi.string().valid('ios', 'android').required().messages({
    'any.required': 'Platform is required.',
    'any.only': 'Platform must be either "ios" or "android".'
  }),

  /**
   * 'receiptData' validation is conditional on the value of 'platform'.
   * - If platform is 'ios', receiptData must be a non-empty string.
   * - If platform is 'android', receiptData must be an object with a required 'token' string and a required 'sku' string.
   */
  receiptData: Joi.when('platform', {
    is: 'ios',
    then: Joi.string().required().messages({
      'string.base': 'Receipt data for iOS must be a string.',
      'any.required': 'Receipt data is required for iOS.',
    }),
    otherwise: Joi.object({
      token: Joi.string().required().messages({
        'string.base': 'Receipt token must be a string.',
        'any.required': 'Receipt token is required for Android.',
      }),
      sku: Joi.string().required().messages({
        'string.base': 'SKU must be a string.',
        'any.required': 'SKU is required for Android.',
      }),
    }).required().messages({
      'object.base': 'Receipt data for Android must be an object.',
      'any.required': 'Receipt data is required for Android.',
    }),
  }),
});