import { Policy } from 'express-gateway';

interface RequestTransformerActionParams {
  // Example configuration for transformations
  renameFields?: Array<{ from: string; to: string; scope?: 'body' | 'query' | 'headers' }>;
  addFields?: Array<{ name: string; value: any; scope?: 'body' | 'query' | 'headers'; fromEgContext?: string }>;
  removeFields?: Array<{ name: string; scope?: 'body' | 'query' | 'headers' }>;
}

function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function setNestedValue(obj: any, path: string, value: any): void {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
            current[parts[i]] = {};
        }
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

function deleteNestedValue(obj: any, path: string): void {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current || !current[parts[i]]) {
            return; // Path doesn't exist
        }
        current = current[parts[i]];
    }
    if (current) {
        delete current[parts[parts.length - 1]];
    }
}


const policy: Policy = {
  name: 'requestTransformerPolicy',
  policy: (actionParams: RequestTransformerActionParams) => {
    return (req: any, res: any, next: (err?: any) => void) => {
      const { renameFields, addFields, removeFields } = actionParams;

      const getScopeObject = (scopeName: string | undefined): any => {
        switch (scopeName) {
          case 'body': return req.body;
          case 'query': return req.query;
          case 'headers': return req.headers;
          default: return req.body; // Default to body if scope is undefined
        }
      };

      // Rename Fields
      if (renameFields) {
        renameFields.forEach(field => {
          const scope = getScopeObject(field.scope);
          if (scope && getNestedValue(scope, field.from) !== undefined) {
            const value = getNestedValue(scope, field.from);
            setNestedValue(scope, field.to, value);
            deleteNestedValue(scope, field.from);
          }
        });
      }

      // Add Fields
      if (addFields) {
        addFields.forEach(field => {
          const scope = getScopeObject(field.scope);
          if (scope) {
            let value = field.value;
            if (field.fromEgContext) {
              value = getNestedValue(req.egContext, field.fromEgContext);
            }
            setNestedValue(scope, field.name, value);
          }
        });
      }

      // Remove Fields
      if (removeFields) {
        removeFields.forEach(field => {
          const scope = getScopeObject(field.scope);
          if (scope) {
            deleteNestedValue(scope, field.name);
          }
        });
      }

      // Example: Add authenticated user ID to headers if available
      if (req.egContext && req.egContext.user && req.egContext.user.userId) {
        if (!req.headers) req.headers = {};
        req.headers['X-Authenticated-User-Id'] = req.egContext.user.userId;
      }

      next();
    };
  },
  schema: {
    $id: 'http://express-gateway.io/schemas/policies/requestTransformerPolicy.json',
    type: 'object',
    properties: {
      renameFields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
            scope: { type: 'string', enum: ['body', 'query', 'headers'] }
          },
          required: ['from', 'to']
        },
        description: 'Rules for renaming fields in the request.'
      },
      addFields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { type: 'any' },
            scope: { type: 'string', enum: ['body', 'query', 'headers'] },
            fromEgContext: { type: 'string', description: 'Path to value in req.egContext (e.g., user.userId)'}
          },
          required: ['name']
        },
        description: 'Rules for adding new fields to the request.'
      },
      removeFields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            scope: { type: 'string', enum: ['body', 'query', 'headers'] }
          },
          required: ['name']
        },
        description: 'Rules for removing fields from the request.'
      }
    },
  },
};

module.exports = policy;