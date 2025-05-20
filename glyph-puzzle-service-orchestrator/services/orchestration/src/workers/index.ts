import { startIapProcessingWorker } from './iap_processing_worker';
import { startScoreSubmissionWorker } from './score_submission_worker';
import { logger } from '../config/logger';

export async function initializeWorkers(): Promise<void> {
  logger.info('Initializing Temporal workers...');

  const workerPromises = [
    startIapProcessingWorker(),
    startScoreSubmissionWorker(),
  ];

  try {
    await Promise.all(workerPromises);
    logger.info('All Temporal workers have been started successfully.');
  } catch (error) {
    logger.error('An error occurred while starting one or more Temporal workers:', error);
    throw error; // Re-throw to be caught by the main service starter
  }
}