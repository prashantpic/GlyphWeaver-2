namespace GlyphPuzzle.UI.Coordinator.Enums
{
    /// <summary>
    /// Specifies the types of color vision deficiency adjustments available in the UI.
    /// Relevant Requirements: REQ-ACC-002, REQ-UIUX-009
    /// </summary>
    public enum ColorblindMode
    {
        /// <summary>
        /// No colorblind mode active. Default rendering.
        /// </summary>
        None,
        /// <summary>
        /// Adjustments for Protanopia (reduced sensitivity to red light).
        /// </summary>
        Protanopia,
        /// <summary>
        /// Adjustments for Deuteranopia (reduced sensitivity to green light).
        /// </summary>
        Deuteranopia,
        /// <summary>
        /// Adjustments for Tritanopia (reduced sensitivity to blue light).
        /// </summary>
        Tritanopia
    }
}