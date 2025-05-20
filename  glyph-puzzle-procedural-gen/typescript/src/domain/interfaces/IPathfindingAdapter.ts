import type { Point } from '../core/Point';

/**
 * Interface (Port) for pathfinding algorithms used by SolvabilityValidatorService on the backend.
 * REQ-CGLE-008, REQ-CGLE-011
 */
export interface IPathfindingAdapter {
  /**
   * Finds a path between a start and end node on a grid.
   * @param startNode The starting point of the path.
   * @param endNode The target ending point of the path.
   * @param gridData Data representing the grid, including dimensions and obstacles.
   *                 The specific structure is determined by the adapter implementation.
   * @param constraints Constraints to apply during pathfinding (e.g., allowed movement).
   *                    The specific structure is determined by the adapter implementation.
   * @returns An array of points representing the path from startNode to endNode.
   *          Returns null if no path is found.
   */
  findPath(
    startNode: Point,
    endNode: Point,
    gridData: any, // Adapter-specific: e.g., { width: number, height: number, obstacles: Point[] }
    constraints: any // Adapter-specific: e.g., { allowDiagonal: boolean }
  ): Point[] | null;
}