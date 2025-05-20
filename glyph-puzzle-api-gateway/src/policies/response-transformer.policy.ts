import { Policy } from 'express-gateway';

interface ResponseTransformerActionParams {
  // Example configuration for transformations
  renameFields?: Array<{ from: string; to: string }>;
  addFields?: Array<{ name: string; value: any }>;
  removeFields?: Array<string>; // Field paths to remove, e.g., "internalDetails.secretKey"
  ensureFieldsPresent?: Array<{ name: string; defaultValue: any }>;
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
  name: 'responseTransformerPolicy',
  policy: (actionParams: ResponseTransformerActionParams) => {
    return (req: any, res: any, next: (err?: any) => void) => {
      // This policy intercepts the response *before* it's sent to the client.
      // It relies on wrapping res.json() or res.send() to modify the body.
      // This is a common pattern but might need adjustment based on Express Gateway's specific mechanisms
      // for response modification post-proxy.

      const originalJson = res.json.bind(res);
      const originalSend = res.send.bind(res);

      const transformBody = (body: any): any => {
        if (typeof body !== 'object' || body === null) {
          return body; // Can only transform objects/arrays
        }

        let transformedBody = JSON.parse(JSON.stringify(body)); // Deep clone to avoid modifying original

        const { renameFields, addFields, removeFields, ensureFieldsPresent } = actionParams;

        // Rename Fields
        if (renameFields) {
          renameFields.forEach(field => {
            const value = getNestedValue(transformedBody, field.from);
            if (value !== undefined) {
              setNestedValue(transformedBody, field.to, value);
              deleteNestedValue(transformedBody, field.from);
            }
          });
        }

        // Add Fields
        if (addFields) {
          addFields.forEach(field => {
            setNestedValue(transformedBody, field.name, field.value);
          });
        }

        // Remove Fields
        if (removeFields) {
          removeFields.forEach(fieldPath => {
            deleteNestedValue(transformedBody, fieldPath);
          });
        }

        // Ensure Fields Present (add with default value if missing)
        if (ensureFieldsPresent) {
            ensureFieldsPresent.forEach(field => {
                if (getNestedValue(transformedBody, field.name) === undefined) {
                    setNestedValue(transformedBody, field.name, field.defaultValue);
                }
            });
        }

        // Example: Add a gateway-specific header or information to the response body
        // transformedBody.gatewayProcessedAt = new Date().toISOString();

        return transformedBody;
      };

      res.json = (body: any) => {
        const transformedBody = transformBody(body);
        return originalJson(transformedBody);
      };

      res.send = (body: any) => {
        // Attempt to parse if JSON, otherwise send as is
        let transformedBody = body;
        if (res.get('Content-Type')?.includes('application/json') && typeof body === 'string') {
          try {
            const parsedBody = JSON.parse(body);
            transformedBody = JSON.stringify(transformBody(parsedBody));
          } catch (e) {
            // Not valid JSON, or transformation failed; send original
            console.warn('Response transformer: Could not parse string body as JSON for transformation.');
          }
        } else if (typeof body === 'object') {
            transformedBody = transformBody(body);
        }
        return originalSend(transformedBody);
      };

      next();
    };
  },
  schema: {
    $id: 'http://express-gateway.io/schemas/policies/responseTransformerPolicy.json',
    type: 'object',
    properties: {
      renameFields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' }
          },
          required: ['from', 'to']
        },
        description: 'Rules for renaming fields in the response body.'
      },
      addFields: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            value: { type: 'any' }
          },
          required: ['name', 'value']
        },
        description: 'Rules for adding new fields to the response body.'
      },
      removeFields: {
        type: 'array',
        items: { type: 'string' },
        description: 'Paths of fields to remove from the response body (e.g., "internalDetails.secret").'
      },
      ensureFieldsPresent: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                name: { type: 'string' },
                defaultValue: { type: 'any'}
            },
            required: ['name', 'defaultValue']
        },
        description: 'Ensures specified fields are present in the response, adding them with a default value if missing.'
      }
    },
  },
};

module.exports = policy;