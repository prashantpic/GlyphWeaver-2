export class UserPrincipal {
  userId: string;
  username?: string; // Optional, might be derived from OAuth profile
  email?: string; // Optional, might be derived from OAuth profile
  roles: string[];
  permissions?: string[]; // Optional, if granular permissions are used
  provider?: string; // e.g., 'google', 'apple', 'local'

  constructor(
    userId: string,
    roles: string[],
    username?: string,
    email?: string,
    permissions?: string[],
    provider?: string,
  ) {
    this.userId = userId;
    this.username = username;
    this.email = email;
    this.roles = roles;
    this.permissions = permissions;
    this.provider = provider;
  }
}