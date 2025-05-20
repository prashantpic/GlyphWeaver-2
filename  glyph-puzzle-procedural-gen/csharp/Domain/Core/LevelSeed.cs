using System;

namespace GlyphPuzzle.Procedural.Client.Domain.Core
{
    /// <summary>
    /// Value object representing the seed used for procedural generation, ensuring reproducibility.
    /// REQ-CGLE-011
    /// </summary>
    public readonly struct LevelSeed : IEquatable<LevelSeed>
    {
        public string Value { get; }

        public LevelSeed(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                throw new ArgumentException("Seed value cannot be null or whitespace.", nameof(value));
            Value = value;
        }

        public bool Equals(LevelSeed other)
        {
            return Value == other.Value;
        }

        public override bool Equals(object obj)
        {
            return obj is LevelSeed other && Equals(other);
        }

        public override int GetHashCode()
        {
            return (Value != null ? Value.GetHashCode() : 0);
        }

        public static bool operator ==(LevelSeed left, LevelSeed right)
        {
            return left.Equals(right);
        }

        public static bool operator !=(LevelSeed left, LevelSeed right)
        {
            return !(left == right);
        }

        public override string ToString()
        {
            return Value;
        }
    }
}