// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as express from 'express';

// Define the structure of the user object attached to the request
interface AuthenticatedUser {
  id: string; // User ID (e.g., UUID from PlayerProfile)
  username: string; // Username
  roles: string[]; // Array of roles (e.g., ['user', 'admin'])
  // Add other relevant properties from JWT payload or user object
}

declare global {
  namespace Express {
    export interface Request {
      user?: AuthenticatedUser; // Attach authenticated user information to the request
    }
  }
}