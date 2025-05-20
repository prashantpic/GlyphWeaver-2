using GlyphPuzzle.UI.Coordinator.Interfaces;
using GlyphPuzzle.UI.Coordinator.State;
using GlyphPuzzle.UI.Coordinator.Enums;
using System;
using UnityEngine;
using UnityEngine.UIElements; // For VisualElement parameter

namespace GlyphPuzzle.UI.Coordinator.Services
{
    /// <summary>
    /// Manages and applies accessibility settings such as colorblind modes,
    /// text scaling, and reduced motion.
    /// </summary>
    public class MasterAccessibilityService : IMasterAccessibilityService
    {
        private readonly ICrossScreenStateManager _crossScreenStateManager;
        private readonly IMasterThemeService _masterThemeService; // To trigger theme re-application

        private UISettingsState CurrentSettings => _crossScreenStateManager.GetSettingsState();

        /// <summary>
        /// Initializes a new instance of the <see cref="MasterAccessibilityService"/> class.
        /// </summary>
        /// <param name="crossScreenStateManager">The cross-screen state manager.</param>
        /// <param name="masterThemeService">The master theme service.</param>
        public MasterAccessibilityService(ICrossScreenStateManager crossScreenStateManager, IMasterThemeService masterThemeService)
        {
            _crossScreenStateManager = crossScreenStateManager ?? throw new ArgumentNullException(nameof(crossScreenStateManager));
            _masterThemeService = masterThemeService ?? throw new ArgumentNullException(nameof(masterThemeService));
        }

        /// <summary>
        /// Initializes the service. Reads initial settings and subscribes to changes.
        /// (This method's content might be part of the constructor or a separate bootstrap phase)
        /// </summary>
        public void Initialize()
        {
            // Initial settings are implicitly loaded by CrossScreenStateManager.
            // We might apply them to a root element here if one is available globally at this stage,
            // or this responsibility is deferred to UIOrchestrator/MasterThemeService.
            Debug.Log("[MasterAccessibilityService] Initialized. Current settings will be applied by UI orchestrator/theme service.");
            // Potentially subscribe to settings changes if this service needs to react directly beyond just providing values.
            // _crossScreenStateManager.SubscribeToSettingsChanges(OnSettingsUpdated);
        }

        // private void OnSettingsUpdated(UISettingsState newSettings)
        // {
        //     // If accessibility settings changed, we might need to trigger a global UI refresh
        //     // This is often handled by MasterThemeService reacting to the same state change.
        // }

        /// <summary>
        /// Sets the active colorblind mode.
        /// </summary>
        /// <param name="mode">The colorblind mode to set.</param>
        public void SetColorblindMode(ColorblindMode mode)
        {
            UISettingsState settings = CurrentSettings;
            if (settings.CurrentColorblindMode != mode)
            {
                settings.CurrentColorblindMode = mode;
                _crossScreenStateManager.UpdateSettingsState(settings);
                // Trigger theme re-application to reflect colorblind mode changes
                _masterThemeService.SetActiveThemeAsync(settings.ActiveThemeName).Forget(); // Re-apply current theme
                Debug.Log($"[MasterAccessibilityService] Colorblind mode set to: {mode}");
            }
        }

        /// <summary>
        /// Gets the current colorblind mode.
        /// </summary>
        /// <returns>The current <see cref="ColorblindMode"/>.</returns>
        public ColorblindMode GetCurrentColorblindMode()
        {
            return CurrentSettings.CurrentColorblindMode;
        }

        /// <summary>
        /// Sets the reduced motion preference.
        /// </summary>
        /// <param name="isEnabled">True to enable reduced motion, false otherwise.</param>
        public void SetReducedMotion(bool isEnabled)
        {
            UISettingsState settings = CurrentSettings;
            if (settings.IsReducedMotionEnabled != isEnabled)
            {
                settings.IsReducedMotionEnabled = isEnabled;
                _crossScreenStateManager.UpdateSettingsState(settings);
                // Notify animation services or systems that rely on this setting.
                // This might be via an event or direct call if SharedAnimationService is accessible.
                Debug.Log($"[MasterAccessibilityService] Reduced motion set to: {isEnabled}");
            }
        }

        /// <summary>
        /// Checks if reduced motion is currently enabled.
        /// </summary>
        /// <returns>True if reduced motion is enabled, false otherwise.</returns>
        public bool IsReducedMotionEnabled()
        {
            return CurrentSettings.IsReducedMotionEnabled;
        }

        /// <summary>
        /// Sets the text scale factor for UI elements.
        /// </summary>
        /// <param name="scaleFactor">The text scale factor (e.g., 1.0 for default, 1.2 for 20% larger).</param>
        public void SetTextScaleFactor(float scaleFactor)
        {
            UISettingsState settings = CurrentSettings;
            // Add clamping or validation if necessary
            scaleFactor = Mathf.Clamp(scaleFactor, 0.5f, 2.0f); // Example range

            if (Math.Abs(settings.TextScaleFactor - scaleFactor) > float.Epsilon)
            {
                settings.TextScaleFactor = scaleFactor;
                _crossScreenStateManager.UpdateSettingsState(settings);
                // Trigger UI updates. This is complex and might involve:
                // 1. Setting a global CSS variable for text scaling.
                // 2. Iterating through all text elements and adjusting their font size.
                // 3. Notifying MasterThemeService to re-apply styles which might include text scaling.
                // For now, log and assume UI elements will query this value or listen to settings changes.
                Debug.Log($"[MasterAccessibilityService] Text scale factor set to: {scaleFactor}");
                // Potentially call ApplyCurrentAccessibilitySettings on the root UI element if available
            }
        }

        /// <summary>
        /// Gets the current text scale factor.
        /// </summary>
        /// <returns>The current text scale factor.</returns>
        public float GetCurrentTextScaleFactor()
        {
            return CurrentSettings.TextScaleFactor;
        }

        /// <summary>
        /// Applies the combined current accessibility settings (colorblind, text scale)
        /// to a given visual element hierarchy. This often involves requesting the
        /// <see cref="IMasterThemeService"/> to re-apply styles with the current accessibility context.
        /// </summary>
        /// <param name="rootElement">The root visual element to apply settings to.</param>
        public void ApplyCurrentAccessibilitySettings(VisualElement rootElement)
        {
            if (rootElement == null) throw new ArgumentNullException(nameof(rootElement));

            Debug.Log("[MasterAccessibilityService] Applying current accessibility settings.");

            // 1. Theme re-application for colorblind mode and potentially other style overrides
            var currentTheme = _masterThemeService.GetCurrentTheme();
            if (currentTheme != null)
            {
                _masterThemeService.ApplyThemeToVisualTree(rootElement, currentTheme);
            }

            // 2. Text Scaling:
            // This is tricky with UI Toolkit. One approach is to set a custom USS property (--text-scale-factor)
            // on the rootElement and have text elements use `var(--text-scale-factor)` in their font-size.
            // Or, iterate through all TextElements and apply scaling.
            // Example for custom property:
            // rootElement.style.SetCustomProperty("--text-scale-factor", GetCurrentTextScaleFactor());
            // This requires USS to be set up to use this variable:
            // .my-text-label { font-size: calc(1em * var(--text-scale-factor)); }

            // For simplicity, we'll assume individual components or a global system handles text scaling
            // based on GetCurrentTextScaleFactor() or by listening to settings changes.
            // A more direct approach for UI Toolkit (less ideal for performance on large UIs):
            // ApplyTextScalingRecursive(rootElement, GetCurrentTextScaleFactor());

            // Reduced motion is typically handled by animation systems (like SharedAnimationService)
            // by querying IsReducedMotionEnabled(). No direct application here usually.
        }

        /*
        // Example for recursive text scaling - use with caution due to performance implications.
        private void ApplyTextScalingRecursive(VisualElement element, float scaleFactor)
        {
            if (element is TextElement textElement)
            {
                // This needs a baseline font size. If styles are well-defined,
                // this might interfere. A better approach is USS variables.
                // For demonstration:
                // float baseSize = textElement.style.fontSize.value.value; // Assuming it was set
                // textElement.style.fontSize = baseSize * scaleFactor;
            }

            foreach (var child in element.Children())
            {
                ApplyTextScalingRecursive(child, scaleFactor);
            }
        }
        */
    }
}