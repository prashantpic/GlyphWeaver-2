namespace GlyphPuzzle.Mobile.DomainLogic.Data.Levels
{
    /// <summary>
    /// Parameters defining the complexity attributes of a level.
    /// Encapsulates parameters that define the complexity introduced in a level,
    /// aiding progressive difficulty. (REQ-CGLE-001)
    /// </summary>
    [System.Serializable] // Useful if embedded in ScriptableObjects or other serializable classes
    public struct LevelComplexityParams
    {
        /// <summary>
        /// The number of distinct glyph types present in the level.
        /// </summary>
        public int NumberOfGlyphTypes;

        /// <summary>
        /// The number of obstacles present in the level.
        /// </summary>
        public int NumberOfObstacles;

        /// <summary>
        /// Indicates if this level introduces a new gameplay mechanic to the player.
        /// </summary>
        public bool IntroducesNewMechanic;

        // Add more parameters as needed, e.g.:
        // public int GridSizeFactor;
        // public int PathLengthExpectation;
        // public bool RequiresAdvancedTechnique;
    }
}