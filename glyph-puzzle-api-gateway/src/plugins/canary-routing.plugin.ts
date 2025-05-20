import { PluginContext } from 'express-gateway'; // Use actual EG types

interface CanaryRouteConfig {
  apiEndpointName: string; // Name of the apiEndpoint to apply this rule to
  stableServiceEndpointName: string; // Name of the stable serviceEndpoint
  canaryServiceEndpointName: string; // Name of the canary serviceEndpoint
  // Strategy 1: Weight-based routing
  canaryWeightPercentage?: number; // 0-100, percentage of traffic to canary
  // Strategy 2: Header-based routing
  canaryHeader?: {
    name: string;
    value: string; // Traffic goes to canary if header name=value
  };
}

interface CanaryRoutingPluginConfig {
  routes: CanaryRouteConfig[];
}

module.exports = {
  version: '1.0.0',
  // This plugin modifies request context to influence the built-in proxy policy.
  // It does not define new policy types itself, but could if more complex logic was needed.
  policies: [],
  init: function(pluginContext: PluginContext) {
    const config: CanaryRoutingPluginConfig = pluginContext.pluginConfig;

    if (!config.routes || config.routes.length === 0) {
      pluginContext.logger.warn('CanaryRoutingPlugin: No routes configured. Plugin will not apply any routing rules.');
      return;
    }

    pluginContext.logger.info('CanaryRoutingPlugin: Initialized with route configurations.');

    // This plugin will add a lightweight middleware to the Express app
    // *before* Express Gateway's main routing and policy execution for matched API Endpoints.
    // This middleware will decide if the request should go to a canary.
    // The standard 'proxy' policy should then be configured to check `req.egContext.overrideServiceEndpoint`.

    config.routes.forEach(routeConfig => {
      // Validate configurations
      if (routeConfig.canaryWeightPercentage && (routeConfig.canaryWeightPercentage < 0 || routeConfig.canaryWeightPercentage > 100)) {
        pluginContext.logger.error(`CanaryRoutingPlugin: Invalid canaryWeightPercentage for ${routeConfig.apiEndpointName}. Must be 0-100.`);
        return;
      }
      if (!pluginContext.apiEndpoints[routeConfig.apiEndpointName]) {
        pluginContext.logger.error(`CanaryRoutingPlugin: apiEndpoint "${routeConfig.apiEndpointName}" not found in gateway config.`);
        return;
      }
       if (!pluginContext.serviceEndpoints[routeConfig.stableServiceEndpointName] || !pluginContext.serviceEndpoints[routeConfig.canaryServiceEndpointName]) {
        pluginContext.logger.error(`CanaryRoutingPlugin: Stable or Canary serviceEndpoint not found for ${routeConfig.apiEndpointName}.`);
        return;
      }


      // The Express Gateway `apiEndpoints` are matched internally.
      // We need to inject logic into the request lifecycle for requests matching this apiEndpoint.
      // One way is to register a global middleware that checks req.egContext.apiEndpoint.name.
      // Or, if EG allows adding middleware per API endpoint easily.
      // For now, we'll assume a middleware that runs for all requests and checks the matched apiEndpoint.

      // This is conceptual: EG needs a way to insert this logic.
      // If EG calls policies as simple (req, res, next) middleware, this plugin could
      // register a "policy" that runs very early for the specified apiEndpoints.
      // Let's assume we can add a handler to the `app` that runs early.
      // This is a simplified model; real EG integration might need to use specific hooks.

      const originalApiEndpointPolicies = pluginContext.pipelines?.[pluginContext.apiEndpoints[routeConfig.apiEndpointName]?.pipeline]?.policies;
      if(originalApiEndpointPolicies && Array.isArray(originalApiEndpointPolicies)){
          // Prepend a custom function/policy-like object to the pipeline definition programmatically
          // This would be an advanced usage and might not be standard/stable.
          // A safer way is often to define a canary routing *policy* and use it in the pipeline.
      }

      pluginContext.logger.info(`CanaryRoutingPlugin: Rule for API Endpoint "${routeConfig.apiEndpointName}": Stable -> ${routeConfig.stableServiceEndpointName}, Canary -> ${routeConfig.canaryServiceEndpointName}`);
    });


    // Add a single, high-level middleware that checks if the current request falls under any canary rule.
    // This should run after EG has identified `req.egContext.apiEndpoint`.
    pluginContext.registerGatewayMiddleware((req: any, res: any, next: Function) => {
        if (!req.egContext || !req.egContext.apiEndpoint || !req.egContext.apiEndpoint.name) {
            return next(); // Not yet processed by EG enough to know the API endpoint
        }

        const matchedRule = config.routes.find(r => r.apiEndpointName === req.egContext.apiEndpoint.name);

        if (matchedRule) {
            let routeToCanary = false;

            // Header-based routing takes precedence
            if (matchedRule.canaryHeader) {
                const headerValue = req.headers[matchedRule.canaryHeader.name.toLowerCase()];
                if (headerValue === matchedRule.canaryHeader.value) {
                    routeToCanary = true;
                    pluginContext.logger.debug(`CanaryRoutingPlugin: Routing to canary for ${req.path} via header ${matchedRule.canaryHeader.name}`);
                }
            }
            // Weight-based routing if no header match or no header rule
            if (!routeToCanary && matchedRule.canaryWeightPercentage !== undefined) {
                if (Math.random() * 100 < matchedRule.canaryWeightPercentage) {
                    routeToCanary = true;
                    pluginContext.logger.debug(`CanaryRoutingPlugin: Routing to canary for ${req.path} via weight ${matchedRule.canaryWeightPercentage}%`);
                }
            }

            if (routeToCanary) {
                req.egContext.overrideServiceEndpoint = matchedRule.canaryServiceEndpointName;
            } else {
                // Explicitly set to stable if rule exists but doesn't match canary conditions
                req.egContext.overrideServiceEndpoint = matchedRule.stableServiceEndpointName;
            }
        }
        next();
    });

    // The proxy policy in the pipeline config should then be modified or aware enough to use:
    // `serviceEndpoint: ${egContext.overrideServiceEndpoint:-defaultStableService}`
    // Or the proxy policy itself needs to be enhanced/customized.
    // Express Gateway's built-in proxy policy may not support this `overrideServiceEndpoint` out of the box.
    // A custom proxy policy might be required if this dynamic selection isn't directly supported.

  },
  schema: {
    $id: 'http://express-gateway.io/schemas/plugins/canaryRoutingPlugin.json',
    type: 'object',
    properties: {
      routes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            apiEndpointName: { type: 'string', description: 'Name of the apiEndpoint this rule applies to.' },
            stableServiceEndpointName: { type: 'string', description: 'Name of the serviceEndpoint for stable traffic.' },
            canaryServiceEndpointName: { type: 'string', description: 'Name of the serviceEndpoint for canary traffic.' },
            canaryWeightPercentage: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Percentage of traffic (0-100) to route to the canary service. Evaluated if header rule does not match or is not present.',
            },
            canaryHeader: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Name of the HTTP header to check.' },
                value: { type: 'string', description: 'Value the header must have to route to canary.' },
              },
              required: ['name', 'value'],
              description: 'Routes to canary if this header is present with the specified value. Takes precedence over weight.',
            },
          },
          required: ['apiEndpointName', 'stableServiceEndpointName', 'canaryServiceEndpointName'],
        },
      },
    },
    required: ['routes'],
  },
};