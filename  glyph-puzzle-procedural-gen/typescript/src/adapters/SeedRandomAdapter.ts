import seedrandom from 'seedrandom';
import { IRandomProvider } from '../domain/interfaces/IRandomProvider';
import { LevelSeed } from '../domain/core/LevelSeed';

/**
 * TypeScript adapter implementation of IRandomProvider using 'seedrandom' library.
 * Provides concrete implementation for seeded random number generation.
 * Implements REQ-CGLE-011.
 */
export class SeedRandomAdapter implements IRandomProvider {
  private random: seedrandom.PRNG | null = null;

  /**
   * Initializes the random number generator with a specific seed.
   * @param seed The seed to use for generating random numbers.
   */
  public initialize(seed: LevelSeed): void {
    this.random = seedrandom(seed);
  }

  /**
   * Returns a random integer within a specified range.
   * @param min The inclusive lower bound of the random number returned.
   * @param max The exclusive upper bound of the random number returned.
   * @returns A random integer greater than or equal to min and less than max.
   */
  public nextInt(min: number, max: number): number {
    if (!this.random) {
      throw new Error('Random provider not initialized. Call initialize() first.');
    }
    return Math.floor(this.random() * (max - min)) + min;
  }

  /**
   * Returns a random floating-point number between 0 (inclusive) and 1 (exclusive).
   * @returns A random floating-point number.
   */
  public nextFloat(): number {
    if (!this.random) {
      throw new Error('Random provider not initialized. Call initialize() first.');
    }
    return this.random();
  }

  /**
   * Shuffles an array in place using the Fisher-Yates algorithm.
   * @param array The array to shuffle.
   * @returns The shuffled array (same instance).
   */
  public shuffle<T>(array: T[]): T[] {
    if (!this.random) {
      throw new Error('Random provider not initialized. Call initialize() first.');
    }
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring swap
    }
    return array;
  }
}