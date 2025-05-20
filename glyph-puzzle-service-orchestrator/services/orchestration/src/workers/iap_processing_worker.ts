import { Worker, NativeConnection } from '@temporalio/worker';
import { config } from '../../config/environment';
import { logger } from '../../config/logger';
import * as iapActivities from '../activities/iap'; // Activities will be defined here
import * as iapWorkflows from '../workflows/iap_processing_workflow'; // Workflow will be defined here

// Placeholder for activities until they are fully implemented
// In a real scenario, these would be imported from '../activities/iap/index.ts'
// and would be actual activity functions.
const activities = {
  verifyIapReceiptActivity: iapActivities.verifyIapReceiptActivity || (async (input: any) => { logger.info('STUB: verifyIapReceiptActivity called', input); return { success: true }; }),
  grantEntitlementActivity: iapActivities.grantEntitlementActivity || (async (input: any) => { logger.info('STUB: grantEntitlementActivity called', input); return { inventoryUpdated: true }; }),
  updatePlayerInventoryActivity: iapActivities.updatePlayerInventoryActivity || (async (input: any) => { logger.info('STUB: updatePlayerInventoryActivity called', input); return { success: true }; }),
  trackIapEventActivity: iapActivities.trackIapEventActivity || (async (input: any) => { logger.info('STUB: trackIapEventActivity called', input); }),
  compensateGrantEntitlementActivity: iapActivities.compensateGrantEntitlementActivity || (async (input: any) => { logger.info('STUB: compensateGrantEntitlementActivity called', input); return { compensationApplied: true }; }),
};

export async function startIapProcessingWorker(): Promise<void> {
  logger.info(`Starting IAP Processing Worker on task queue: ${config.temporalIapProcessingTaskQueue}`);

  // In a production setup, the Temporal Client and Connection might be managed
  // globally (e.g., via src/temporal_client.ts) and passed to workers.
  // For simplicity here, we create a connection directly.
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
  // The above commented out tls section is an example. Actual loading might differ.

  const worker = await Worker.create({
    connection,
    namespace: config.temporalNamespace,
    taskQueue: config.temporalIapProcessingTaskQueue,
    // workflowsPath: require.resolve('../workflows/iap_processing_workflow'), // Option 1: if workflows are in a single file
    workflows: iapWorkflows, // Option 2: if importing an object with workflow functions
    activities, // Pass the activities object
  });

  try {
    await worker.run();
    logger.info('IAP Processing Worker started successfully.');
  } catch (err) {
    logger.error('IAP Processing Worker failed to start or encountered an error:', err);
    // Gracefully close the connection on error during worker run
    await connection.close().catch(closeErr => logger.error('Failed to close connection for IAP worker', closeErr));
    throw err; // Re-throw to allow higher-level error handling
  }
}