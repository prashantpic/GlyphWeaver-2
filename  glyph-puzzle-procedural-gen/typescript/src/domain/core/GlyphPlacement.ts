import type { Point } from './Point';

/**
 * Value object representing a glyph's type and its position on the grid.
 * REQ-CGLE-008
 */
export interface GlyphPlacement {
  /**
   * The type identifier for the glyph.
   */
  glyphType: string;
  /**
   * The position of the glyph on the grid.
   */
  position: Point;
  /**
   * Identifier for matching glyph pairs.
   * A value of 0 might indicate a non-paired glyph or a special case.
   * Must be a non-negative integer.
   */
  pairId: number;
}