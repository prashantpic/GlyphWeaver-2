using System;

namespace GlyphPuzzle.Procedural.Client.Domain.Core
{
    /// <summary>
    /// Value object representing an obstacle's type and its position on the grid.
    /// REQ-CGLE-008
    /// </summary>
    public readonly struct ObstaclePlacement : IEquatable<ObstaclePlacement>
    {
        public string ObstacleType { get; }
        public Point Position { get; }

        public ObstaclePlacement(string obstacleType, Point position)
        {
            if (string.IsNullOrWhiteSpace(obstacleType))
                throw new ArgumentException("ObstacleType cannot be null or whitespace.", nameof(obstacleType));

            ObstacleType = obstacleType;
            Position = position;
        }

        public bool Equals(ObstaclePlacement other)
        {
            return ObstacleType == other.ObstacleType && Position.Equals(other.Position);
        }

        public override bool Equals(object obj)
        {
            return obj is ObstaclePlacement other && Equals(other);
        }

        public override int GetHashCode()
        {
            return HashCode.Combine(ObstacleType, Position);
        }

        public static bool operator ==(ObstaclePlacement left, ObstaclePlacement right)
        {
            return left.Equals(right);
        }

        public static bool operator !=(ObstaclePlacement left, ObstaclePlacement right)
        {
            return !(left == right);
        }

        public override string ToString()
        {
            return $"Obstacle: {ObstacleType}, Pos: {Position}";
        }
    }
}