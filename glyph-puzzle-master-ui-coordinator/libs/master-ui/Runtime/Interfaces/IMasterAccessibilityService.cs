using GlyphPuzzle.UI.Coordinator.Enums;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Coordinator.Interfaces
{
    /// <summary>
    /// Defines the contract for managing and applying accessibility settings.
    /// This includes colorblind modes, text scaling, and reduced motion preferences.
    /// </summary>
    public interface IMasterAccessibilityService
    {
        /// <summary>
        /// Initializes the accessibility service.
        /// </summary>
        void Initialize();

        /// <summary>
        /// Sets the active colorblind mode.
        /// This will trigger UI updates to apply appropriate styles.
        /// </summary>
        /// <param name="mode">The <see cref="ColorblindMode"/> to set.</param>
        void SetColorblindMode(ColorblindMode mode);

        /// <summary>
        /// Gets the currently active colorblind mode.
        /// </summary>
        /// <returns>The current <see cref="ColorblindMode"/>.</returns>
        ColorblindMode GetCurrentColorblindMode();

        /// <summary>
        /// Sets the reduced motion preference.
        /// </summary>
        /// <param name="isEnabled">True to enable reduced motion, false otherwise.</param>
        void SetReducedMotion(bool isEnabled);

        /// <summary>
        /// Checks if reduced motion is currently enabled.
        /// </summary>
        /// <returns>True if reduced motion is enabled, false otherwise.</returns>
        bool IsReducedMotionEnabled();

        /// <summary>
        /// Sets the global text scale factor.
        /// Values typically range from 0.5 to 2.0, where 1.0 is the default size.
        /// </summary>
        /// <param name="scaleFactor">The desired text scale factor.</param>
        void SetTextScaleFactor(float scaleFactor);

        /// <summary>
        /// Gets the current global text scale factor.
        /// </summary>
        /// <returns>The current text scale factor.</returns>
        float GetCurrentTextScaleFactor();

        /// <summary>
        /// Applies all current accessibility settings (colorblind mode, text scale, etc.)
        /// to a given visual element and its hierarchy. This often involves coordination
        /// with the <see cref="IMasterThemeService"/> to re-apply styles.
        /// </summary>
        /// <param name="rootElement">The root visual element to which settings should be applied.</param>
        void ApplyCurrentAccessibilitySettings(VisualElement rootElement);
    }
}