import type { Point } from './Point';

/**
 * Value object representing an obstacle's type and its position on the grid.
 * REQ-CGLE-008
 */
export interface ObstaclePlacement {
  /**
   * The type identifier for the obstacle.
   */
  obstacleType: string;
  /**
   * The position of the obstacle on the grid.
   */
  position: Point;
}