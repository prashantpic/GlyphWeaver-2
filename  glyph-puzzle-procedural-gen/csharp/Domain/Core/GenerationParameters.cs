using System;
using System.Collections.Generic;
using System.Linq;

namespace GlyphPuzzle.Procedural.Client.Domain.Core
{
    /// <summary>
    /// Defines parameters used for procedural level generation, such as grid size, glyph types, difficulty, etc.
    /// This class is designed to be immutable.
    /// REQ-CGLE-008, REQ-CGLE-011, REQ-CGLE-013
    /// </summary>
    public sealed class GenerationParameters : IEquatable<GenerationParameters>
    {
        public GridDimensions GridSize { get; }
        public int NumberOfGlyphTypes { get; }
        public int MinGlyphPairs { get; }
        public int MaxGlyphPairs { get; }
        public int MaxObstacles { get; }
        public IReadOnlyList<string> AllowedPuzzleTypes { get; }
        public int DifficultyTier { get; }

        public GenerationParameters(
            GridDimensions gridSize,
            int numberOfGlyphTypes,
            int minGlyphPairs,
            int maxGlyphPairs,
            int maxObstacles,
            IReadOnlyList<string> allowedPuzzleTypes,
            int difficultyTier)
        {
            if (numberOfGlyphTypes <= 0)
                throw new ArgumentOutOfRangeException(nameof(numberOfGlyphTypes), "Number of glyph types must be positive.");
            if (minGlyphPairs <= 0)
                throw new ArgumentOutOfRangeException(nameof(minGlyphPairs), "Minimum glyph pairs must be positive.");
            if (maxGlyphPairs < minGlyphPairs)
                throw new ArgumentOutOfRangeException(nameof(maxGlyphPairs), "Maximum glyph pairs cannot be less than minimum glyph pairs.");
            if (maxObstacles < 0)
                throw new ArgumentOutOfRangeException(nameof(maxObstacles), "Maximum obstacles cannot be negative.");
            if (allowedPuzzleTypes == null || !allowedPuzzleTypes.Any())
                throw new ArgumentException("Allowed puzzle types cannot be null or empty.", nameof(allowedPuzzleTypes));
            if (difficultyTier < 0)
                throw new ArgumentOutOfRangeException(nameof(difficultyTier), "Difficulty tier cannot be negative.");

            GridSize = gridSize;
            NumberOfGlyphTypes = numberOfGlyphTypes;
            MinGlyphPairs = minGlyphPairs;
            MaxGlyphPairs = maxGlyphPairs;
            MaxObstacles = maxObstacles;
            AllowedPuzzleTypes = allowedPuzzleTypes.ToList().AsReadOnly(); // Defensive copy
            DifficultyTier = difficultyTier;
        }

        public bool Equals(GenerationParameters other)
        {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return GridSize.Equals(other.GridSize) &&
                   NumberOfGlyphTypes == other.NumberOfGlyphTypes &&
                   MinGlyphPairs == other.MinGlyphPairs &&
                   MaxGlyphPairs == other.MaxGlyphPairs &&
                   MaxObstacles == other.MaxObstacles &&
                   AllowedPuzzleTypes.SequenceEqual(other.AllowedPuzzleTypes) &&
                   DifficultyTier == other.DifficultyTier;
        }

        public override bool Equals(object obj)
        {
            return ReferenceEquals(this, obj) || obj is GenerationParameters other && Equals(other);
        }

        public override int GetHashCode()
        {
            var hashCode = new HashCode();
            hashCode.Add(GridSize);
            hashCode.Add(NumberOfGlyphTypes);
            hashCode.Add(MinGlyphPairs);
            hashCode.Add(MaxGlyphPairs);
            hashCode.Add(MaxObstacles);
            if (AllowedPuzzleTypes != null)
            {
                foreach (var type in AllowedPuzzleTypes)
                {
                    hashCode.Add(type);
                }
            }
            hashCode.Add(DifficultyTier);
            return hashCode.ToHashCode();
        }

        public static bool operator ==(GenerationParameters left, GenerationParameters right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(GenerationParameters left, GenerationParameters right)
        {
            return !Equals(left, right);
        }
    }
}