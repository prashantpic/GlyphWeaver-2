// This barrel file will eventually export all activity functions and types.
// Activities are grouped by domain (e.g., iap, score) in subdirectories.
// Each subdirectory (e.g., ./iap, ./score) should have its own index.ts barrel file.

// Example:
// export * from './iap'; // Assuming ./iap/index.ts exports all IAP related activities
// export * from './score'; // Assuming ./score/index.ts exports all Score related activities
// export * from './shared'; // For any shared activities

// As the actual activity files and their sub-barrels (e.g., ./iap/index.ts)
// are not generated in the current step, this file exports from paths that
// are expected to exist later. This will allow workflows to type `proxyActivities`
// using `import * as activities from '../activities';`
//
// This will cause TypeScript errors during compilation until ./iap/index.ts and
// ./score/index.ts (and their respective activity files) are created and export members.
// This is an expected part of iterative generation.

export * from './iap';
export * from './score';
// Add other sub-module exports here if new activity categories are added.