/**
 * @interface LevelSummaryDto
 * @description A lightweight Data Transfer Object representing a summary of a level.
 * Used for lists where full detail is not required.
 */
export interface LevelSummaryDto {
    id: string;
    levelNumber: number;
    type: 'handcrafted' | 'procedural_template';
}

/**
 * @interface GlyphInstanceDto
 * @description DTO for a glyph instance within a level's detail.
 */
export interface GlyphInstanceDto {
    glyphId: string;
    position: { x: number; y: number };
    properties?: object;
}

/**
 * @interface ObstacleInstanceDto
 * @description DTO for an obstacle instance within a level's detail.
 */
export interface ObstacleInstanceDto {
    obstacleId: string;
    position: { x: number; y: number };
}

/**
 * @interface LevelDetailDto
 * @description A detailed Data Transfer Object for a single level's configuration.
 * This represents the data sent to the client, omitting sensitive or internal data like solutions.
 */
export interface LevelDetailDto {
    id: string;
    zoneId: string;
    levelNumber: number;
    type: 'handcrafted' | 'procedural_template';
    gridSize: number;
    timeLimit?: number;
    moveLimit?: number;
    glyphs: GlyphInstanceDto[];
    obstacles: ObstacleInstanceDto[];
    puzzleTypes: string[];
}