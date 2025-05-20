import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { environmentConfig } from './environment';

const swaggerOptions: swaggerJsdoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Glyph Puzzle Backend API',
      version: '1.0.0',
      description: 'API documentation for the Glyph Puzzle backend services.',
      contact: {
        name: 'Glyph Puzzle Team',
        email: 'dev@glyphpuzzle.com',
      },
    },
    servers: [
      {
        url: `/api/v1`,
        description: `${environmentConfig.nodeEnv} server`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT Bearer token **_only_**',
        },
        adminApiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-Admin-API-Key',
            description: 'Admin API Key for administrative endpoints'
        }
      },
    },
    security: [ // Global security, can be overridden at operation level
      {
        bearerAuth: [],
      },
    ],
  },
  // Path to the API docs
  // Note: Update this path if your DTOs and route definitions are in different locations
  apis: [
    './src/api/**/*.routes.ts',
    './src/api/**/*.controller.ts', // If JSDoc comments are in controllers
    './src/api/**/*.dto.ts', // If DTOs have JSDoc for schema definitions
    './src/api/**/dtos/*.dto.ts' // More specific DTO path
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "Glyph Puzzle API Docs",
    // customCss: '.swagger-ui .topbar { display: none }' // Example: hide topbar
  }));
};

export default setupSwagger;