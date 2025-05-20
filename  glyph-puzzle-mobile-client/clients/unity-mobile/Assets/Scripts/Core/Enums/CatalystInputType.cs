namespace GlyphPuzzle.Mobile.Core.Enums
{
    /// <summary>
    /// Enumerates the different input methods for Catalyst glyph activation.
    /// Used by REQ-ACC-001.
    /// </summary>
    public enum CatalystInputType
    {
        /// <summary>
        /// Standard tap interaction.
        /// </summary>
        Tap,

        /// <summary>
        /// Alternative two-step interaction (select cell, then confirm).
        /// </summary>
        SelectAndConfirm
    }
}