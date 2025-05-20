using System;
using System.Collections.Generic;
using System.Linq;

namespace GlyphPuzzle.Procedural.Client.Domain.Core
{
    /// <summary>
    /// Value object representing a sequence of points forming a solution path for a glyph pair or sequence.
    /// This class is designed to be immutable.
    /// REQ-CGLE-011
    /// </summary>
    public class SolutionPath : IEquatable<SolutionPath>
    {
        /// <summary>
        /// The sequence of points forming the path.
        /// </summary>
        public IReadOnlyList<Point> PathPoints { get; }

        /// <summary>
        /// Identifier for the glyph pair this path solves.
        /// </summary>
        public int GlyphPairId { get; }

        public SolutionPath(IReadOnlyList<Point> pathPoints, int glyphPairId)
        {
            if (pathPoints == null)
                throw new ArgumentNullException(nameof(pathPoints));
            if (pathPoints.Count < 2) // A path needs at least a start and end point
                throw new ArgumentException("PathPoints must contain at least two points.", nameof(pathPoints));
            if (glyphPairId < 0) // Assuming PairId is non-negative
                throw new ArgumentOutOfRangeException(nameof(glyphPairId), "GlyphPairId cannot be negative.");

            PathPoints = pathPoints.ToList().AsReadOnly(); // Defensive copy
            GlyphPairId = glyphPairId;
        }

        public bool Equals(SolutionPath other)
        {
            if (ReferenceEquals(null, other)) return false;
            if (ReferenceEquals(this, other)) return true;
            return PathPoints.SequenceEqual(other.PathPoints) && GlyphPairId == other.GlyphPairId;
        }

        public override bool Equals(object obj)
        {
            if (ReferenceEquals(null, obj)) return false;
            if (ReferenceEquals(this, obj)) return true;
            if (obj.GetType() != this.GetType()) return false;
            return Equals((SolutionPath)obj);
        }

        public override int GetHashCode()
        {
            int hashCode = GlyphPairId.GetHashCode();
            if (PathPoints != null)
            {
                foreach (var point in PathPoints)
                {
                    hashCode = HashCode.Combine(hashCode, point.GetHashCode());
                }
            }
            return hashCode;
        }

        public static bool operator ==(SolutionPath left, SolutionPath right)
        {
            return Equals(left, right);
        }

        public static bool operator !=(SolutionPath left, SolutionPath right)
        {
            return !Equals(left, right);
        }
        
        public override string ToString()
        {
            return $"PairId: {GlyphPairId}, PathLength: {PathPoints?.Count ?? 0}";
        }
    }
}