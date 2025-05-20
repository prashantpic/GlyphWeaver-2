/**
 * Represents a role within the system.
 * Roles are typically assigned to users and group a set of permissions.
 */
export interface IRole {
    id: string; // Unique identifier for the role (e.g., 'admin', 'editor', 'player')
    name: string; // Human-readable name of the role
    description?: string; // Optional description of the role's purpose
    permissions: string[]; // Array of permission keys associated with this role
}

/**
 * Represents a specific permission within the system.
 * Permissions define the ability to perform a particular action on a resource.
 */
export interface IPermission {
    key: string; // Unique key for the permission (e.g., 'user:create', 'level:edit', 'iap:validate')
    name: string; // Human-readable name of the permission
    description?: string; // Optional description of what this permission allows
}

/**
 * Defines the structure of user permissions, typically attached to the request object
 * after successful authentication and authorization context setup.
 * This would be derived from the UserPrincipal's roles/claims.
 */
export interface IUserPermissionsContext {
    userId: string;
    roles: string[]; // Array of role keys/names the user possesses
    permissions: string[]; // Array of permission keys the user directly or indirectly (via roles) possesses
    // Optionally, other contextual data for policy evaluation
    // tenantId?: string;
    // organizationId?: string;
}

/**
 * Interface for a policy evaluation component.
 * Useful for more complex authorization logic beyond simple role/permission checks.
 */
export interface IPolicyEvaluator {
    /**
     * Evaluates if a user has permission for a given action on a resource.
     * @param userContext The user's permission context.
     * @param action The action being attempted (e.g., 'read', 'write', 'delete').
     * @param resource The resource being acted upon (e.g., 'level_data', 'user_profile').
     * @param resourceAttributes Optional attributes of the resource for fine-grained control.
     * @returns A promise that resolves to true if authorized, false otherwise.
     */
    can(
        userContext: IUserPermissionsContext,
        action: string,
        resource: string,
        resourceAttributes?: Record<string, any>
    ): Promise<boolean>;
}