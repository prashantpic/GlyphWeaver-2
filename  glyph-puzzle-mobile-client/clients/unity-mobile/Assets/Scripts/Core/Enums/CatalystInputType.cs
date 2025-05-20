namespace GlyphPuzzle.Mobile.Core.Enums
{
    /// <summary>
    /// Enumerates the different input methods for Catalyst glyph activation.
    /// Used to support accessibility options as per REQ-ACC-001.
    /// </summary>
    public enum CatalystInputType
    {
        /// <summary>
        /// Standard tap interaction.
        /// The player taps directly on the Catalyst glyph to activate it.
        /// </summary>
        Tap,

        /// <summary>
        /// Alternative two-step interaction (select cell, then confirm).
        /// The player first selects the grid cell containing the Catalyst,
        /// then performs a separate confirmation action to activate it.
        /// This can help players with motor impairments or who prefer a more deliberate input method.
        /// </summary>
        SelectAndConfirm
    }
}