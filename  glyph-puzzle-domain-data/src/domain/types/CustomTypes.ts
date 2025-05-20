export interface GridPosition {
    row: number;
    col: number;
}

export type SolutionPath = GridPosition[];

export enum PuzzleType {
    PATH = 'PATH',
    SEQUENCE = 'SEQUENCE',
    COLOR_MATCH = 'COLOR_MATCH',
    CONSTRAINT = 'CONSTRAINT', // Example of adding another type
    // ... other puzzle types
}

export enum ObstacleType {
    BLOCKER_STONE = 'BLOCKER_STONE',
    SHIFTING_TILE = 'SHIFTING_TILE',
    PORTAL = 'PORTAL', // Example of adding another type
    // ... other obstacle types
}

export interface GridDimensions {
    rows: number;
    columns: number;
}