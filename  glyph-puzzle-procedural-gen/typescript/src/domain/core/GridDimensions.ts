/**
 * Value object representing the dimensions (rows, columns) of the game grid.
 * REQ-CGLE-008
 */
export interface GridDimensions {
  /**
   * The number of rows in the grid. Must be a positive integer.
   */
  rows: number;
  /**
   * The number of columns in the grid. Must be a positive integer.
   */
  columns: number;
}