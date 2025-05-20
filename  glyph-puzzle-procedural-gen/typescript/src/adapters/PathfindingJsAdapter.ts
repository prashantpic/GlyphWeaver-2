import { Grid, AStarFinder, FinderOptions, Util } from 'pathfinding';
import { IPathfindingAdapter } from '../domain/interfaces/IPathfindingAdapter';
import { Point } from '../domain/core/Point';

/**
 * Represents the grid data required for pathfinding.
 * Width and height define grid dimensions.
 * Obstacles is an array of points that are unwalkable.
 */
export interface PathfindingGridData {
  width: number;
  height: number;
  obstacles: Point[];
}

/**
 * Defines constraints for pathfinding, such as movement type.
 */
export interface PathfindingAdapterConstraints {
  allowDiagonal?: boolean;
  dontCrossCorners?: boolean;
  heuristic?: (dx: number, dy: number) => number;
  weight?: number; // For weighted A*
}

/**
 * TypeScript adapter implementation of IPathfindingAdapter using 'pathfinding' npm package.
 * Provides a concrete pathfinding implementation for the backend.
 * Implements REQ-CGLE-008, REQ-CGLE-011.
 */
export class PathfindingJsAdapter implements IPathfindingAdapter {
  /**
   * Finds a path between two points on a grid.
   * @param startNode The starting point of the path.
   * @param endNode The ending point of the path.
   * @param gridData Data describing the grid, including dimensions and obstacles.
   * @param constraints Constraints for pathfinding, like allowing diagonal movement.
   * @returns An array of points representing the path, or null if no path is found.
   */
  public findPath(
    startNode: Point,
    endNode: Point,
    gridData: PathfindingGridData,
    constraints?: PathfindingAdapterConstraints
  ): Point[] | null {
    if (!gridData || gridData.width <= 0 || gridData.height <= 0) {
      console.error('Invalid grid data provided for pathfinding.');
      return null;
    }

    const grid = new Grid(gridData.width, gridData.height);

    // Mark obstacles on the grid
    if (gridData.obstacles) {
      for (const obstacle of gridData.obstacles) {
        if (
          obstacle.x >= 0 && obstacle.x < gridData.width &&
          obstacle.y >= 0 && obstacle.y < gridData.height
        ) {
          grid.setWalkableAt(obstacle.x, obstacle.y, false);
        }
      }
    }

    const finderOptions: FinderOptions = {
      allowDiagonal: constraints?.allowDiagonal ?? false,
      dontCrossCorners: constraints?.dontCrossCorners ?? true, // Default to true for grid puzzles
    };
    if (constraints?.heuristic) {
        finderOptions.heuristic = constraints.heuristic;
    }
    if (constraints?.weight) {
        finderOptions.weight = constraints.weight;
    }

    const finder = new AStarFinder(finderOptions);

    try {
      // The pathfinding library returns path as Array<[number, number]>
      const pathCoords: Array<[number, number]> = finder.findPath(
        startNode.x,
        startNode.y,
        endNode.x,
        endNode.y,
        grid
      );

      if (pathCoords && pathCoords.length > 0) {
        return pathCoords.map((coord) => ({ x: coord[0], y: coord[1] }));
      } else {
        return null; // No path found
      }
    } catch (error) {
      console.error('Error during pathfinding:', error);
      return null;
    }
  }
}