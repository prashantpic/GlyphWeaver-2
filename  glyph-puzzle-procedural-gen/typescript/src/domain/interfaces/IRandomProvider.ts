import type { LevelSeed } from '../core/LevelSeed';

/**
 * Interface (Port) for a seeded random number generator, crucial for reproducibility on the backend.
 * REQ-CGLE-011
 */
export interface IRandomProvider {
  /**
   * Initializes the random number generator with a specific seed.
   * @param seed The seed to use for generation.
   */
  initialize(seed: LevelSeed): void;

  /**
   * Returns a random integer within a specified range.
   * @param min The inclusive lower bound of the random number returned.
   * @param max The exclusive upper bound of the random number returned. max must be greater than or equal to min.
   * @returns An integer greater than or equal to min and less than max.
   */
  nextInt(min: number, max: number): number;

  /**
   * Returns a random floating-point number that is greater than or equal to 0.0, and less than 1.0.
   * @returns A floating-point number that is greater than or equal to 0.0, and less than 1.0.
   */
  nextFloat(): number;

  /**
   * Shuffles the elements of the specified array in place.
   * @template T The type of the elements of the array.
   * @param array The array to shuffle.
   * @returns The shuffled array (same instance).
   */
  shuffle<T>(array: T[]): T[];
}