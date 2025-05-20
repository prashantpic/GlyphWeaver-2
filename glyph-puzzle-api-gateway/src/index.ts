import expressGateway from 'express-gateway';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
// Ensure this is done before Express Gateway loads its configuration if it relies on process.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('Starting API Gateway...');
console.log(`Environment PORT: ${process.env.PORT}`);
console.log(`Environment LOG_LEVEL: ${process.env.LOG_LEVEL}`);

// Express Gateway will automatically look for gateway.config.yml and system.config.yml
// in the 'config' directory relative to where it's run, or where its package.json is.
// If your config files are elsewhere, you might need to use programmatic loading options.

// Bootstrap Express Gateway
// The options object can be used to specify paths to config files if they are not in default locations
// or if you want to override certain configurations programmatically.
const options = {
  // gatewayConfigPath: path.join(__dirname, '../config/gateway.config.yml'),
  // systemConfigPath: path.join(__dirname, '../config/system.config.yml'),
};

expressGateway.bootstrap(options, (err?: Error) => {
  if (err) {
    console.error('Failed to bootstrap Express Gateway:', err);
    process.exit(1);
  }
  // The port logging here might be redundant if Express Gateway logs it,
  // but can be useful for confirmation.
  // Note: Express Gateway's internal server will use the port from gateway.config.yml
  console.log('Express Gateway bootstrapped successfully.');
  // Actual listening port is determined by gateway.config.yml
});

// Graceful shutdown (optional but good practice)
const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
signals.forEach(signal => {
  process.on(signal, () => {
    console.log(`\nReceived ${signal}, shutting down API Gateway gracefully...`);
    // Express Gateway might have its own shutdown mechanism.
    // If not, or if additional cleanup is needed:
    // server.close(() => { // Assuming `server` is the HTTP server instance from EG
    //   console.log('API Gateway closed.');
    //   process.exit(0);
    // });
    // For now, let Express Gateway handle its shutdown or rely on process exit.
    // A more robust shutdown would involve closing Redis connections, etc.
    process.exit(0); // Simple exit, EG might handle more gracefully.
  });
});