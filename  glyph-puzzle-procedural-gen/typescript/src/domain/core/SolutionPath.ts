import type { Point } from './Point';

/**
 * Value object representing a sequence of points forming a solution path
 * for a glyph pair or sequence.
 * REQ-CGLE-011
 */
export interface SolutionPath {
  /**
   * The sequence of points forming the path. Must contain at least two points.
   */
  pathPoints: Point[];
  /**
   * Identifier for the glyph pair this path solves.
   * Must be a non-negative integer.
   */
  glyphPairId: number;
}