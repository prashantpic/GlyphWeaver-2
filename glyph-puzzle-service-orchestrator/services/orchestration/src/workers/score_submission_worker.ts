import { Worker, NativeConnection } from '@temporalio/worker';
import { config } from '../../config/environment';
import { logger } from '../../config/logger';
import * as scoreActivities from '../activities/score'; // Activities will be defined here
import * as scoreWorkflows from '../workflows/score_submission_workflow'; // Workflow will be defined here

// Placeholder for activities until they are fully implemented
// In a real scenario, these would be imported from '../activities/score/index.ts'
// and would be actual activity functions.
const activities = {
  validateScoreIntegrityActivity: scoreActivities.validateScoreIntegrityActivity || (async (input: any) => { logger.info('STUB: validateScoreIntegrityActivity called', input); return { isValid: true }; }),
  runCheatDetectionActivity: scoreActivities.runCheatDetectionActivity || (async (input: any) => { logger.info('STUB: runCheatDetectionActivity called', input); return { cheatDetected: false }; }),
  updateLeaderboardActivity: scoreActivities.updateLeaderboardActivity || (async (input: any) => { logger.info('STUB: updateLeaderboardActivity called', input); return { submissionId: 'fake-submission-id' }; }),
  compensateUpdateLeaderboardActivity: scoreActivities.compensateUpdateLeaderboardActivity || (async (input: any) => { logger.info('STUB: compensateUpdateLeaderboardActivity called', input); return { compensationApplied: true }; }),
  synchronizeCloudSaveActivity: scoreActivities.synchronizeCloudSaveActivity || (async (input: any) => { logger.info('STUB: synchronizeCloudSaveActivity called', input); }),
  logScoreSubmissionAuditActivity: scoreActivities.logScoreSubmissionAuditActivity || (async (input: any) => { logger.info('STUB: logScoreSubmissionAuditActivity called', input); }),
};

export async function startScoreSubmissionWorker(): Promise<void> {
  logger.info(`Starting Score Submission Worker on task queue: ${config.temporalScoreSubmissionTaskQueue}`);

  const connectionOptions = {
    address: config.temporalAddress,
    // tls: config.temporalClientCertPath && config.temporalClientKeyPath ? {
    //   clientCertPair: {
    //     crt: Buffer.from(config.temporalClientCertPath), // Or fs.readFileSync
    //     key: Buffer.from(config.temporalClientKeyPath), // Or fs.readFileSync
    //   },
    // } : undefined,
  };

  const connection = await NativeConnection.create(connectionOptions);
  // Note: If mTLS is configured, ensure certs are loaded correctly.

  const worker = await Worker.create({
    connection,
    namespace: config.temporalNamespace,
    taskQueue: config.temporalScoreSubmissionTaskQueue,
    // workflowsPath: require.resolve('../workflows/score_submission_workflow'),
    workflows: scoreWorkflows,
    activities,
  });

  try {
    await worker.run();
    logger.info('Score Submission Worker started successfully.');
  } catch (err) {
    logger.error('Score Submission Worker failed to start or encountered an error:', err);
    // Gracefully close the connection on error during worker run
    await connection.close().catch(closeErr => logger.error('Failed to close connection for Score worker', closeErr));
    throw err; // Re-throw to allow higher-level error handling
  }
}