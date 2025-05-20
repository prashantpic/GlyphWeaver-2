using System.Collections.Generic;
using GlyphPuzzle.Procedural.Client.Domain.Core;

namespace GlyphPuzzle.Procedural.Client.Domain.Interfaces
{
    /// <summary>
    /// Represents the setup of the grid for pathfinding, including dimensions and obstacles.
    /// This is a generic structure; specific adapters might need more detailed configurations.
    /// </summary>
    public class GridSetup
    {
        public GridDimensions Dimensions { get; }
        public IReadOnlyList<Point> ObstaclePositions { get; }

        public GridSetup(GridDimensions dimensions, IReadOnlyList<Point> obstaclePositions)
        {
            Dimensions = dimensions;
            ObstaclePositions = obstaclePositions ?? new List<Point>().AsReadOnly();
        }
    }

    /// <summary>
    /// Represents constraints for pathfinding, such as allowed movement types.
    /// This is a generic structure; specific adapters might need more detailed configurations.
    /// </summary>
    public class PathfindingConstraints
    {
        /// <summary>
        /// Gets or sets a value indicating whether diagonal movement is allowed.
        /// </summary>
        public bool AllowDiagonalMovement { get; set; } = false;

        // Add other constraints as needed, e.g., movement costs, specific tile types to avoid.
    }

    /// <summary>
    /// Interface (Port) for pathfinding algorithms used by SolvabilityValidator.
    /// REQ-CGLE-008, REQ-CGLE-011
    /// </summary>
    public interface IPathfindingService
    {
        /// <summary>
        /// Finds a path between a start and end node on a grid.
        /// </summary>
        /// <param name="startNode">The starting point of the path.</param>
        /// <param name="endNode">The target ending point of the path.</param>
        /// <param name="gridData">Data representing the grid, including dimensions and obstacles.</param>
        /// <param name="constraints">Constraints to apply during pathfinding (e.g., allowed movement).</param>
        /// <returns>A list of points representing the path from startNode to endNode. Returns an empty list or null if no path is found.</returns>
        IReadOnlyList<Point> FindPath(Point startNode, Point endNode, GridSetup gridData, PathfindingConstraints constraints);
    }
}