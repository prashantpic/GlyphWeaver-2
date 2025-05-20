using System;

namespace GlyphPuzzle.Procedural.Client.Domain.Core
{
    /// <summary>
    /// Value object representing a glyph's type and its position on the grid.
    /// REQ-CGLE-008
    /// </summary>
    public readonly struct GlyphPlacement : IEquatable<GlyphPlacement>
    {
        public string GlyphType { get; }
        public Point Position { get; }
        /// <summary>
        /// For matching pairs. A value of 0 might indicate a non-paired glyph or a special case.
        /// </summary>
        public int PairId { get; }

        public GlyphPlacement(string glyphType, Point position, int pairId)
        {
            if (string.IsNullOrWhiteSpace(glyphType))
                throw new ArgumentException("GlyphType cannot be null or whitespace.", nameof(glyphType));
            if (pairId < 0)
                throw new ArgumentOutOfRangeException(nameof(pairId), "PairId cannot be negative.");

            GlyphType = glyphType;
            Position = position;
            PairId = pairId;
        }

        public bool Equals(GlyphPlacement other)
        {
            return GlyphType == other.GlyphType && Position.Equals(other.Position) && PairId == other.PairId;
        }

        public override bool Equals(object obj)
        {
            return obj is GlyphPlacement other && Equals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(GlyphType, Position, PairId);
        }

        public static bool operator ==(GlyphPlacement left, GlyphPlacement right)
        {
            return left.Equals(right);
        }

        public static bool operator !=(GlyphPlacement left, GlyphPlacement right)
        {
            return !(left == right);
        }
        
        public override string ToString()
        {
            return $"Glyph: {GlyphType}, Pos: {Position}, PairId: {PairId}";
        }
    }
}