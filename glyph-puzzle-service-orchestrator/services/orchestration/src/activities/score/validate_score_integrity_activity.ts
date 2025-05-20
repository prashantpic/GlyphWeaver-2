import { ApplicationFailure, Context } from '@temporalio/activity';
import Joi from 'joi';
import { ScoreSubmissionData, ValidationResult } from '../../interfaces/score.interfaces'; // Placeholder
// Assuming validation_schemas.ts will export this. For now, define inline.
// import { scoreSubmissionSchema } from '../../utils/validation_schemas'; 

// Placeholder for Joi schema
const scoreSubmissionSchema = Joi.object({
  playerId: Joi.string().guid({ version: 'uuidv4' }).required(),
  score: Joi.number().integer().min(0).required(),
  levelId: Joi.string().guid({ version: 'uuidv4' }).required(),
  zoneId: Joi.string().guid({ version: 'uuidv4' }).required(),
  gameplaySessionData: Joi.object().required(), // Could be more detailed
  // ... other fields
});


export async function validateScoreIntegrityActivity(
  input: ScoreSubmissionData
): Promise<ValidationResult> {
  const { log } = Context.current();
  log.info('Validate score integrity activity started', { playerId: input.playerId, levelId: input.levelId });

  try {
    const { error, value } = scoreSubmissionSchema.validate(input, { abortEarly: false });

    if (error) {
      log.warn('Score integrity validation failed', { playerId: input.playerId, errors: error.details });
      // This would be a custom ScoreIntegrityError
      throw ApplicationFailure.create({
        message: 'Score data validation failed',
        type: 'ScoreIntegrityError',
        nonRetryable: true,
        details: error.details.map(d => ({ message: d.message, path: d.path })),
      });
    }

    // Potentially more complex business rule validation here if not covered by Joi
    // For example, checking if levelId exists, if score is plausible for the level etc.
    // This might involve calls to other services, making it a more complex activity.
    // For this example, we assume Joi validation is sufficient for "integrity".

    log.info('Score integrity validation successful', { playerId: input.playerId });
    return { isValid: true, validatedData: value };
  } catch (err) {
    if (err instanceof ApplicationFailure) {
      throw err;
    }
    log.error('Unexpected error during score integrity validation', { playerId: input.playerId, error: err });
    throw ApplicationFailure.create({
        message: 'An unexpected error occurred during score validation.',
        type: 'UnexpectedValidationError',
        cause: err as Error,
        nonRetryable: true,
    });
  }
}