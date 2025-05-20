import { PluginContext, ServiceEndpoint } from 'express-gateway'; // Use actual EG types
import http from 'http'; // Or https, or a client library like axios

interface ServiceDiscoveryPluginConfig {
  providerUrl: string; // e.g., http://consul-agent:8500/v1/health/service/
  servicesToDiscover: Array<{
    name: string; // Name of the service endpoint in gateway.config.yml
    discoveryName: string; // Name of the service as registered in the discovery provider
    portTag?: string; // Optional tag to identify the correct port if multiple are exposed
  }>;
  pollingIntervalMs?: number;
  requestTimeoutMs?: number;
}

module.exports = {
  version: '1.0.0',
  policies: [],
  init: function(pluginContext: PluginContext) {
    const config: ServiceDiscoveryPluginConfig = pluginContext.pluginConfig;

    if (!config.providerUrl || !config.servicesToDiscover || config.servicesToDiscover.length === 0) {
      pluginContext.logger.warn('ServiceDiscoveryPlugin: Missing required configuration (providerUrl, servicesToDiscover). Plugin will not run.');
      return;
    }

    const pollingInterval = config.pollingIntervalMs || 30000; // Default 30s
    const requestTimeout = config.requestTimeoutMs || 5000; // Default 5s

    const updateServiceEndpoints = async () => {
      pluginContext.logger.info('ServiceDiscoveryPlugin: Fetching service instances...');

      for (const service of config.servicesToDiscover) {
        const discoveryUrl = `${config.providerUrl.replace(/\/$/, '')}/${service.discoveryName}`; // Ensure no double slashes

        try {
          // This is a simplified HTTP GET request. In production, use a robust HTTP client like axios.
          // Example: fetching healthy service instances from Consul's health API
          // The response format depends on your service discovery provider.
          // Consul: [{ Service: { Address, Port, Tags, Meta } }]
          const responseBody = await new Promise<string>((resolve, reject) => {
            const req = http.get(discoveryUrl, { timeout: requestTimeout }, (res) => {
              let data = '';
              res.on('data', (chunk) => data += chunk);
              res.on('end', () => {
                if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                  resolve(data);
                } else {
                  reject(new Error(`Failed to fetch ${discoveryUrl}, status: ${res.statusCode}, body: ${data}`));
                }
              });
            });
            req.on('error', reject);
            req.on('timeout', () => {
                req.destroy(); // Destroy the request explicitly on timeout
                reject(new Error(`Request to ${discoveryUrl} timed out after ${requestTimeout}ms`));
            });
          });

          const instances: any[] = JSON.parse(responseBody);
          const healthyUrls: string[] = [];

          instances.forEach((inst: any) => {
            // Adapt this logic to match your discovery provider's response structure
            const address = inst.Service?.Address || inst.Node?.Address; // Consul specific paths
            let port = inst.Service?.Port;

            if (service.portTag && inst.Service?.Tags?.includes(service.portTag)) {
                // Logic to extract port from tag or use a specific port if tagged
                // This part is highly dependent on how ports are advertised
            } else if (inst.Service?.Meta && inst.Service.Meta[`${service.portTag}_port`]) {
                port = parseInt(inst.Service.Meta[`${service.portTag}_port`], 10);
            }


            if (address && port) {
              healthyUrls.push(`http://${address}:${port}`); // Assuming http, adjust if https
            }
          });

          if (healthyUrls.length > 0) {
            // Update the service endpoint in Express Gateway's configuration
            // This assumes pluginContext.config.gatewayConfig.serviceEndpoints is the live config
            // EG's internal mechanism for updating service endpoints should be used if available.
            // For simplicity, we're directly modifying a conceptual structure.
            // A more robust solution might involve EG's Admin API or specific update functions.
            if (pluginContext.gatewayConfig?.serviceEndpoints && pluginContext.gatewayConfig.serviceEndpoints[service.name]) {
                pluginContext.gatewayConfig.serviceEndpoints[service.name].urls = healthyUrls; // EG might use 'urls' for multiple instances
                 pluginContext.logger.info(`ServiceDiscoveryPlugin: Updated "${service.name}" with instances: ${healthyUrls.join(', ')}`);
            } else if (pluginContext.serviceEndpoints && pluginContext.serviceEndpoints[service.name]) { // Fallback to older context access
                pluginContext.serviceEndpoints[service.name].urls = healthyUrls;
                pluginContext.logger.info(`ServiceDiscoveryPlugin: Updated "${service.name}" with instances: ${healthyUrls.join(', ')}`);
            } else {
                 pluginContext.logger.warn(`ServiceDiscoveryPlugin: Service endpoint "${service.name}" not found in gateway configuration.`);
            }
          } else {
            pluginContext.logger.warn(`ServiceDiscoveryPlugin: No healthy instances found for "${service.discoveryName}". Existing configuration for "${service.name}" will be maintained.`);
          }

        } catch (error: any) {
          pluginContext.logger.error(`ServiceDiscoveryPlugin: Error updating "${service.name}" (from ${service.discoveryName}): ${error.message}`);
        }
      }
    };

    // Initial fetch and set up polling
    updateServiceEndpoints().catch(err => pluginContext.logger.error("Initial service discovery failed:", err));
    const intervalId = setInterval(() => {
        updateServiceEndpoints().catch(err => pluginContext.logger.error("Periodic service discovery failed:", err));
    }, pollingInterval);

    // TODO: Implement graceful shutdown if needed (clearInterval(intervalId))
    // pluginContext.on('close', () => clearInterval(intervalId));
  },
  schema: {
    $id: 'http://express-gateway.io/schemas/plugins/serviceDiscoveryPlugin.json',
    type: 'object',
    properties: {
      providerUrl: {
        type: 'string',
        description: 'Base URL of the service discovery provider API (e.g., Consul health API endpoint).',
      },
      servicesToDiscover: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'The name of the serviceEndpoint in gateway.config.yml.' },
            discoveryName: { type: 'string', description: 'The name of the service as registered in the discovery provider.' },
            portTag: { type: 'string', description: 'Optional. A tag used by the service to advertise its primary HTTP port if multiple are present.'}
          },
          required: ['name', 'discoveryName'],
        },
        minItems: 1,
      },
      pollingIntervalMs: {
        type: 'integer',
        description: 'How often to poll the discovery service (in milliseconds).',
        default: 30000,
      },
      requestTimeoutMs: {
        type: 'integer',
        description: 'Timeout for requests to the discovery service (in milliseconds).',
        default: 5000,
      }
    },
    required: ['providerUrl', 'servicesToDiscover'],
  },
};