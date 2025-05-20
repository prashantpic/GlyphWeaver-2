using System;
using System.Collections.Generic;
using UnityEngine;

// Assuming ColorPaletteProfileSO and PatternDefinitionSO are defined in this namespace or accessible.
// namespace GlyphPuzzle.UI.Accessibility { public class PatternDefinitionSO : ScriptableObject { ... } }
// namespace GlyphPuzzle.UI.Accessibility { public class ColorPaletteProfileSO : ScriptableObject { ... } }

namespace GlyphPuzzle.UI.Accessibility
{
    public class AccessibilityManager
    {
        private static AccessibilityManager _instance;
        public static AccessibilityManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new AccessibilityManager();
                }
                return _instance;
            }
        }

        public ColorblindMode CurrentColorblindMode { get; private set; } = ColorblindMode.Off;
        public event Action<ColorblindMode> OnColorblindModeChanged;

        private ColorPaletteProfileSO _currentColorProfile;
        
        // Example: Dictionary to hold loaded profiles. This would be populated, e.g., in Initialize or on demand.
        private Dictionary<ColorblindMode, ColorPaletteProfileSO> _colorPaletteProfiles = new Dictionary<ColorblindMode, ColorPaletteProfileSO>();

        private AccessibilityManager()
        {
            // Private constructor for Singleton
            // Initialization, like loading all profiles, could happen here or in a separate Init method.
            // For simplicity, we'll load profiles on demand in SetColorblindMode.
        }
        
        public void InitializeProfiles(Dictionary<ColorblindMode, ColorPaletteProfileSO> profiles)
        {
            _colorPaletteProfiles = profiles ?? new Dictionary<ColorblindMode, ColorPaletteProfileSO>();
            // Optionally set initial mode if a profile for 'Off' exists
            if (_colorPaletteProfiles.TryGetValue(ColorblindMode.Off, out var defaultProfile))
            {
                _currentColorProfile = defaultProfile;
            }
        }


        public void SetColorblindMode(ColorblindMode mode)
        {
            if (CurrentColorblindMode == mode && _currentColorProfile != null) // Avoid reloading if mode hasn't changed and profile is loaded
                return;

            CurrentColorblindMode = mode;

            // Load the corresponding ColorPaletteProfileSO.
            // This could be from a pre-populated dictionary or Resources.Load, Addressables, etc.
            if (_colorPaletteProfiles.TryGetValue(mode, out ColorPaletteProfileSO profile))
            {
                _currentColorProfile = profile;
            }
            else
            {
                // Fallback: attempt to load from Resources by naming convention
                // Assumes profiles are named e.g., "DeuteranopiaProfile.asset" in a "Resources/ColorPaletteProfiles" folder
                string profileName = $"{mode.ToString()}ColorProfile"; // Or some other convention
                _currentColorProfile = Resources.Load<ColorPaletteProfileSO>($"Accessibility/ColorPalettes/{profileName}");
                
                if (_currentColorProfile != null)
                {
                    _colorPaletteProfiles[mode] = _currentColorProfile; // Cache if loaded
                }
                else
                {
                     Debug.LogWarning($"[AccessibilityManager] ColorPaletteProfileSO for mode '{mode}' not found or loaded. Adaptations may not work.");
                }
            }
            
            OnColorblindModeChanged?.Invoke(mode);
        }

        public bool TryGetAdaptedColor(Color originalColor, out Color adaptedColor)
        {
            adaptedColor = originalColor; // Default to original
            if (_currentColorProfile == null || _currentColorProfile.ColorMappings == null)
            {
                return false;
            }

            foreach (var mapping in _currentColorProfile.ColorMappings)
            {
                // Comparing colors directly can be problematic due to float precision.
                // Consider using a threshold or comparing Color32.
                if (Mathf.Approximately(mapping.OriginalColor.r, originalColor.r) &&
                    Mathf.Approximately(mapping.OriginalColor.g, originalColor.g) &&
                    Mathf.Approximately(mapping.OriginalColor.b, originalColor.b) &&
                    Mathf.Approximately(mapping.OriginalColor.a, originalColor.a))
                {
                    adaptedColor = mapping.AdaptedColor;
                    return true;
                }
            }
            return false;
        }

        public bool TryGetPatternForIdentifier(string identifier, out PatternDefinitionSO patternDef)
        {
            patternDef = null;
            if (_currentColorProfile == null || _currentColorProfile.PatternAssignments == null)
            {
                return false;
            }

            foreach (var assignment in _currentColorProfile.PatternAssignments)
            {
                if (assignment.Identifier == identifier)
                {
                    patternDef = assignment.Pattern;
                    return patternDef != null;
                }
            }
            return false;
        }
        
        // Method to get ColorPaletteProfileSO by mode (as per file definition)
        // This seems redundant if _currentColorProfile is managed internally, but provided for completeness.
        public ColorPaletteProfileSO GetColorPaletteProfile(ColorblindMode mode)
        {
            if (_colorPaletteProfiles.TryGetValue(mode, out ColorPaletteProfileSO profile))
            {
                return profile;
            }
            // Optionally load if not found, similar to SetColorblindMode
            string profileName = $"{mode.ToString()}ColorProfile";
            var loadedProfile = Resources.Load<ColorPaletteProfileSO>($"Accessibility/ColorPalettes/{profileName}");
            if(loadedProfile != null)
            {
                _colorPaletteProfiles[mode] = loadedProfile;
                return loadedProfile;
            }
            return null;
        }
    }
}