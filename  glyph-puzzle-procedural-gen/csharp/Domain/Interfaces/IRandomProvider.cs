using System.Collections.Generic;
using GlyphPuzzle.Procedural.Client.Domain.Core;

namespace GlyphPuzzle.Procedural.Client.Domain.Interfaces
{
    /// <summary>
    /// Interface (Port) for a seeded random number generator, crucial for reproducibility.
    /// REQ-CGLE-011
    /// </summary>
    public interface IRandomProvider
    {
        /// <summary>
        /// Initializes the random number generator with a specific seed.
        /// </summary>
        /// <param name="seed">The seed to use for generation.</param>
        void Initialize(LevelSeed seed);

        /// <summary>
        /// Returns a non-negative random integer that is less than the specified maximum.
        /// </summary>
        /// <param name="minValue">The inclusive lower bound of the random number returned.</param>
        /// <param name="maxValue">The exclusive upper bound of the random number returned. maxValue must be greater than or equal to minValue.</param>
        /// <returns>A 32-bit signed integer greater than or equal to minValue and less than maxValue.</returns>
        int Next(int minValue, int maxValue);

        /// <summary>
        /// Returns a random floating-point number that is greater than or equal to 0.0, and less than 1.0.
        /// </summary>
        /// <returns>A double-precision floating point number that is greater than or equal to 0.0, and less than 1.0.</returns>
        double NextDouble();

        /// <summary>
        /// Shuffles the elements of the specified list.
        /// </summary>
        /// <typeparam name="T">The type of the elements of the list.</typeparam>
        /// <param name="list">The list to shuffle.</param>
        void Shuffle<T>(IList<T> list);
    }
}