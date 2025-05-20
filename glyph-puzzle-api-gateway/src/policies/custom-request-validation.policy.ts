import { Policy } from 'express-gateway';
import Joi from 'joi';
import { ErrorResponseDto } from '../dto/error-response.dto';

interface CustomRequestValidationActionParams {
  // Example: a key to identify which schema to use for validation
  // This allows one policy to handle validation for multiple endpoints if schema definitions are managed elsewhere or dynamically
  schemaKey?: string;
  // Or, more complex rules can be defined directly in the policy configuration
  validationRules?: {
    body?: Joi.SchemaLike;
    query?: Joi.SchemaLike;
    params?: Joi.SchemaLike;
    headers?: Joi.SchemaLike;
  };
}

// Example: Define Joi schemas for specific requests.
// In a real application, these might be imported or managed more centrally.
const scoreSubmissionSchema = Joi.object({
  levelId: Joi.string().required().min(1).max(50),
  score: Joi.number().integer().min(0).required(),
  checksum: Joi.string().hex().length(32).required(), // Example: MD5 checksum
  // Add more fields as needed
});


const policy: Policy = {
  name: 'customRequestValidationPolicy',
  policy: (actionParams: CustomRequestValidationActionParams) => {
    return (req: any, res: any, next: (err?: any) => void) => {
      let schemaToValidateAgainst: { body?: Joi.Schema, query?: Joi.Schema, params?: Joi.Schema, headers?: Joi.Schema } = {};

      // Determine schema based on actionParams or request properties (e.g., path)
      if (actionParams.validationRules) {
        if (actionParams.validationRules.body) schemaToValidateAgainst.body = Joi.compile(actionParams.validationRules.body);
        if (actionParams.validationRules.query) schemaToValidateAgainst.query = Joi.compile(actionParams.validationRules.query);
        if (actionParams.validationRules.params) schemaToValidateAgainst.params = Joi.compile(actionParams.validationRules.params);
        if (actionParams.validationRules.headers) schemaToValidateAgainst.headers = Joi.compile(actionParams.validationRules.headers);
      } else {
        // Example: Dynamically select schema based on request path
        if (req.path.endsWith('/game/submit-score') && req.method === 'POST') {
          schemaToValidateAgainst.body = scoreSubmissionSchema;
        }
        // Add more dynamic schema selections here
      }


      const validationOptions: Joi.ValidationOptions = {
        abortEarly: false, // Report all errors
        allowUnknown: true, // Allow properties not defined in schema (for headers typically)
        stripUnknown: false, // Do not remove unknown properties
      };

      const partsToValidate: Array<{ partName: string, schema?: Joi.Schema, data: any }> = [
        { partName: 'body', schema: schemaToValidateAgainst.body, data: req.body },
        { partName: 'query', schema: schemaToValidateAgainst.query, data: req.query },
        { partName: 'params', schema: schemaToValidateAgainst.params, data: req.params },
        { partName: 'headers', schema: schemaToValidateAgainst.headers, data: req.headers },
      ];

      const allValidationErrors: any[] = [];

      for (const part of partsToValidate) {
        if (part.schema && part.data) {
          const { error, value } = part.schema.validate(part.data, validationOptions);
          if (error) {
            allValidationErrors.push(...error.details.map(detail => ({
              field: `${part.partName}.${detail.path.join('.')}`,
              message: detail.message,
              type: detail.type,
            })));
          } else {
            // Update the request part with validated (and potentially coerced) value
            if (part.partName === 'body') req.body = value;
            else if (part.partName === 'query') req.query = value;
            else if (part.partName === 'params') req.params = value;
            else if (part.partName === 'headers') req.headers = value; // Be cautious with headers
          }
        }
      }


      // Perform custom checksum validation (example)
      if (req.path.endsWith('/game/submit-score') && req.method === 'POST' && req.body) {
        const { levelId, score, checksum } = req.body;
        // TODO: Implement actual checksum calculation logic.
        // This usually involves a shared secret or a specific algorithm.
        // For example: const calculatedChecksum = crypto.createHash('md5').update(`${levelId}-${score}-${process.env.CHECKSUM_SECRET}`).digest('hex');
        const calculatedChecksum = "mockcalculatedchecksumplaceholder"; // Placeholder
        if (checksum !== calculatedChecksum) {
          allValidationErrors.push({
            field: 'body.checksum',
            message: 'Checksum validation failed.',
            type: 'checksum.mismatch',
          });
        }
      }


      if (allValidationErrors.length > 0) {
        const errorResponse: ErrorResponseDto = {
          statusCode: 400, // Or 422 Unprocessable Entity for semantic validation failures
          message: 'Request validation failed.',
          errorCode: 'VALIDATION_ERROR',
          timestamp: new Date().toISOString(),
          path: req.path,
          details: allValidationErrors,
        };
        return res.status(errorResponse.statusCode).json(errorResponse);
      }

      next();
    };
  },
  schema: {
    $id: 'http://express-gateway.io/schemas/policies/customRequestValidationPolicy.json',
    type: 'object',
    properties: {
      schemaKey: {
        type: 'string',
        description: 'A key to identify a pre-defined validation schema.',
      },
      validationRules: {
        type: 'object',
        properties: {
            body: { type: 'object', description: 'Joi schema definition for request body.'},
            query: { type: 'object', description: 'Joi schema definition for query parameters.'},
            params: { type: 'object', description: 'Joi schema definition for path parameters.'},
            headers: { type: 'object', description: 'Joi schema definition for request headers.'},
        },
        description: 'Explicit Joi schema definitions for different parts of the request.',
      }
    },
  },
};

module.exports = policy;