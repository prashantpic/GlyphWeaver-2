namespace GlyphPuzzle.Procedural.Client.Application.DTOs
{
    /// <summary>
    /// Data Transfer Object carrying player progression information for difficulty scaling.
    /// REQ-CGLE-013
    /// </summary>
    public class PlayerProgressionContextDto
    {
        /// <summary>
        /// The current zone the player is in.
        /// </summary>
        public int CurrentZone { get; init; }

        /// <summary>
        /// The number of procedural levels completed by the player.
        /// </summary>
        public int ProceduralLevelsCompleted { get; init; }

        public PlayerProgressionContextDto(int currentZone, int proceduralLevelsCompleted)
        {
            CurrentZone = currentZone;
            ProceduralLevelsCompleted = proceduralLevelsCompleted;
        }
    }
}