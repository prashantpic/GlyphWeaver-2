import { PluginContext, ExpressGatewayApp } from 'express-gateway'; // Use Express Gateway types if available
import express from 'express';
import path from 'path';
import swaggerUi from 'swagger-ui-dist';

interface SwaggerPluginConfig {
  openapiSpecPath?: string; // Relative path from project root to openapi.yml
  swaggerUiRoute?: string; // Base route for Swagger UI
}

module.exports = {
  version: '1.0.0',
  policies: [], // This plugin does not define new policies
  init: function(pluginContext: PluginContext) {
    const config: SwaggerPluginConfig = pluginContext.pluginConfig || {};
    const app: ExpressGatewayApp = pluginContext.expressApp; // Standard way to get the app

    if (!app) {
      pluginContext.logger.error('SwaggerPlugin: Express app instance not found. Cannot initialize Swagger UI.');
      return;
    }

    const projectRoot = pluginContext.gatewayConfig?.systemConfig?.plugins?.swaggerPlugin?.package
        ? path.dirname(pluginContext.gatewayConfig.systemConfig.plugins.swaggerPlugin.package) // plugin dir
        : path.join(__dirname, '..'); // fallback to src/

    const defaultSpecPath = path.resolve(projectRoot, '../public/openapi.yml'); // Adjust if plugin is in src/plugins
    const openapiSpecPath = path.resolve(config.openapiSpecPath || defaultSpecPath);
    const swaggerUiRoute = config.swaggerUiRoute || '/api-docs'; // Default route

    pluginContext.logger.info(`SwaggerPlugin: Serving OpenAPI spec from ${openapiSpecPath}`);
    pluginContext.logger.info(`SwaggerPlugin: Serving Swagger UI at ${swaggerUiRoute}`);

    // 1. Serve the openapi.yml file
    app.get(`${swaggerUiRoute}/openapi.yml`, (req, res) => {
      res.sendFile(openapiSpecPath, (err) => {
        if (err) {
          pluginContext.logger.error(`SwaggerPlugin: Error serving OpenAPI spec file: ${err.message}`);
          res.status(404).send('OpenAPI specification file not found.');
        }
      });
    });

    // 2. Serve Swagger UI static assets
    const swaggerUiAssetPath = swaggerUi.getAbsoluteFSPath();
    app.use(swaggerUiRoute, express.static(swaggerUiAssetPath));

    // 3. Optionally, redirect the base UI route to include index.html if needed,
    // or ensure index.html is properly configured in swagger-ui-dist.
    // Typically, accessing `swaggerUiRoute` (e.g., /api-docs) should automatically load index.html
    // from the static assets if `index: 'index.html'` is a default for express.static.
    // If not, an explicit redirect or a custom handler for the base path might be needed.
    // The index.html served by swagger-ui-dist is pre-configured to look for swagger-config.json or a URL.
    // We need to ensure it loads our spec.

    // It is common for swagger-ui-dist's index.html to take `url` as a query param.
    // If not, we might need to serve a custom index.html or inject the URL.
    // However, modern swagger-ui often allows configuration via a `swagger-initializer.js` or directly.
    // The easiest is to ensure the UI loads the spec from `${swaggerUiRoute}/openapi.yml`.
    // This is often the default behavior if no other config is found, or can be set in swagger-ui's options.
    // The static serving should handle `index.html` from `swaggerUiAssetPath`.
    // The `url` parameter is a common way to point SwaggerUI to the spec.
    // Example: /api-docs?url=/api-docs/openapi.yml
    // Or, more robustly, the index.html can be configured to look for a local `openapi.yml`
    // The `swagger-ui-dist` often includes an `index.html` that will load `openapi.yml` from the `url` query param by default or can be configured.

    pluginContext.logger.info(`SwaggerPlugin: Swagger UI should be available at ${swaggerUiRoute} (pointing to spec at ${swaggerUiRoute}/openapi.yml)`);
  },
  schema: {
    $id: 'http://express-gateway.io/schemas/plugins/swaggerPlugin.json',
    type: 'object',
    properties: {
      openapiSpecPath: {
        type: 'string',
        description: 'Absolute or relative path to the OpenAPI specification file (e.g., public/openapi.yml). Defaults to ../public/openapi.yml relative to plugin.',
      },
      swaggerUiRoute: {
        type: 'string',
        description: 'The base Express route where Swagger UI will be served (e.g., /api-docs).',
        default: '/api-docs',
      },
    },
  },
};