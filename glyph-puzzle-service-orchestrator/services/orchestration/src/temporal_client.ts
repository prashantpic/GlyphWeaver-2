import { Client, Connection, ConnectionOptions } from '@temporalio/client';
import { NativeConnection } from '@temporalio/worker'; // For TLS options
import { config } from '../config'; // Assuming config is loaded and validated

let temporalClient: Client | undefined;

async function createConnection(): Promise<Connection> {
  const { address, clientCertPath, clientKeyPath, namespace }_typed = config.temporal;

  const connectionOptions: ConnectionOptions = {
    address,
  };

  if (clientCertPath && clientKeyPath) {
    connectionOptions.tls = {
      clientCertPair: {
        crt: Buffer.from(clientCertPath), // Assuming path contains actual cert, not path to file
        key: Buffer.from(clientKeyPath), // Or use fs.readFileSync if they are paths
      },
    };
    // For file paths, it should be:
    // import fs from 'fs';
    // connectionOptions.tls = await NativeConnection.createTLSConnector({
    //   clientCert: fs.readFileSync(clientCertPath),
    //   clientKey: fs.readFileSync(clientKeyPath),
    //   // serverNameOverride, serverRootCACertificate if needed
    // });
    // The spec says "TEMPORAL_CLIENT_CERT_PATH: string (optional, for mTLS)"
    // This usually means path to a file. Let's adjust to load from file if paths are given.
    // However, NativeConnection.createTLSConnector is for worker, client ConnectionOptions are simpler.
    // Let's assume clientCertPath and clientKeyPath are the actual cert/key content if ConnectionOptions.tls expects buffers.
    // Or, more commonly, these are paths to files.
    // The @temporalio/client.ConnectionOptions.tls is actually `tls?: TLSOptions | true;`
    // and TLSOptions is `GRPC.ChannelCredentials`
    // Let's use NativeConnection for simplicity in creating credentials from files, then pass to client.
    // No, client Connection directly supports `tls: { clientCertPair: { crt: Buffer, key: Buffer } }`
    // So paths must be read. For now, let's stick to the simpler assumption from spec or make it clear.
    // Simpler: assume config provides the buffers directly if paths are too complex for this stage.
    // The spec just says "path", so fs.readFileSync is appropriate.

    try {
        const fs = await import('fs');
        connectionOptions.tls = {
            clientCertPair: {
                crt: fs.readFileSync(clientCertPath),
                key: fs.readFileSync(clientKeyPath),
            },
            // serverRootCACertificate?: Buffer; // If CA cert is needed
            // serverNameOverride?: string; // If server name override is needed
        };
    } catch (error) {
        console.error('Failed to load TLS certificates for Temporal client:', error);
        // Potentially re-throw or handle as a fatal error preventing client creation
        throw new Error('Failed to load Temporal TLS certificates. Check TEMPORAL_CLIENT_CERT_PATH and TEMPORAL_CLIENT_KEY_PATH.');
    }

  }

  return await Connection.connect(connectionOptions);
}

export async function getTemporalClient(): Promise<Client> {
  if (!temporalClient) {
    const connection = await createConnection();
    temporalClient = new Client({
      connection,
      namespace: config.temporal.namespace,
    });
  }
  return temporalClient;
}

// Optional: export a pre-initialized client if startup logic handles the async nature
// export const client = await getTemporalClient(); // This would make the module async

// Recommended: Export the function and let callers handle the promise
// Or, initialize it once and export the instance if the main entry point can await this.
// For now, let's keep getTemporalClient as the primary export.

// If a singleton instance is strictly required by the definition "Provides a singleton":
let clientInstance: Client;

export const initializeTemporalClient = async (): Promise<void> => {
    if (!clientInstance) {
        const connection = await createConnection();
        clientInstance = new Client({
            connection,
            namespace: config.temporal.namespace,
        });
        console.log('Temporal client initialized.');
    }
};

export const getClient = (): Client => {
    if (!clientInstance) {
        throw new Error('Temporal client has not been initialized. Call initializeTemporalClient first.');
    }
    return clientInstance;
};