using System;
using System.Collections.Generic;
using GlyphPuzzle.Procedural.Client.Domain.Core;
using GlyphPuzzle.Procedural.Client.Domain.Interfaces;

namespace GlyphPuzzle.Procedural.Client.Adapters
{
    /// <summary>
    /// Adapter implementation of IRandomProvider using System.Random.
    /// Provides concrete implementation for seeded random number generation based on the SeedRandom concept for C#.
    /// Implements REQ-CGLE-011.
    /// </summary>
    public class SeedRandomProvider : IRandomProvider
    {
        private Random _random;

        public SeedRandomProvider()
        {
            // Initialize with a time-based seed if not explicitly initialized later.
            // However, Initialize(LevelSeed) should always be called for reproducible results.
            _random = new Random();
        }

        /// <summary>
        /// Initializes the random number generator with a specific seed.
        /// </summary>
        /// <param name="seed">The seed to use for generating random numbers.</param>
        public void Initialize(LevelSeed seed)
        {
            if (string.IsNullOrEmpty(seed.Value))
            {
                // Fallback if seed value is empty, though LevelSeed constructor should prevent this.
                _random = new Random();
            }
            else
            {
                // System.Random uses an int for seed. GetHashCode can produce collisions
                // but is a simple way to convert a string seed. For more robust seeding,
                // a custom RNG or a library that handles string seeds better would be preferable.
                _random = new Random(seed.Value.GetHashCode());
            }
        }

        /// <summary>
        /// Returns a non-negative random integer that is less than the specified maximum.
        /// </summary>
        /// <param name="minValue">The inclusive lower bound of the random number returned.</param>
        /// <param name="maxValue">The exclusive upper bound of the random number returned. maxValue must be greater than or equal to minValue.</param>
        /// <returns>A 32-bit signed integer greater than or equal to minValue and less than maxValue.</returns>
        public int Next(int minValue, int maxValue)
        {
            if (_random == null)
                throw new InvalidOperationException("Random provider not initialized with a seed.");
            return _random.Next(minValue, maxValue);
        }

        /// <summary>
        /// Returns a random floating-point number that is greater than or equal to 0.0, and less than 1.0.
        /// </summary>
        /// <returns>A double-precision floating point number greater than or equal to 0.0, and less than 1.0.</returns>
        public double NextDouble()
        {
            if (_random == null)
                throw new InvalidOperationException("Random provider not initialized with a seed.");
            return _random.NextDouble();
        }

        /// <summary>
        /// Shuffles the elements in a list using the Fisher-Yates algorithm.
        /// </summary>
        /// <typeparam name="T">The type of elements in the list.</typeparam>
        /// <param name="list">The list to shuffle.</param>
        public void Shuffle<T>(IList<T> list)
        {
            if (_random == null)
                throw new InvalidOperationException("Random provider not initialized with a seed.");
            
            int n = list.Count;
            while (n > 1)
            {
                n--;
                int k = _random.Next(n + 1);
                (list[k], list[n]) = (list[n], list[k]);
            }
        }
    }
}