using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UIElements;

// Assuming ThemeDefinitionSO is defined in this namespace or accessible
// namespace GlyphPuzzle.UI.Management { public class ThemeDefinitionSO : ScriptableObject { ... } }

namespace GlyphPuzzle.UI.Management // As per SDS Section 7
{
    public class ThemeManager
    {
        private static ThemeManager _instance;
        public static ThemeManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = new ThemeManager();
                }
                return _instance;
            }
        }

        private VisualElement _rootVisualElement;
        private readonly List<StyleSheet> _activeThemeSheets = new List<StyleSheet>();
        
        // Example: Dictionary to hold loaded themes. This would be populated.
        private Dictionary<string, ThemeDefinitionSO> _loadedThemes = new Dictionary<string, ThemeDefinitionSO>();

        private ThemeManager()
        {
            // Private constructor for Singleton
        }

        public void Initialize(VisualElement rootElement)
        {
            _rootVisualElement = rootElement;
        }
        
        public void InitializeThemes(Dictionary<string, ThemeDefinitionSO> themes)
        {
            _loadedThemes = themes ?? new Dictionary<string, ThemeDefinitionSO>();
        }


        public void ApplyTheme(ThemeDefinitionSO theme)
        {
            if (_rootVisualElement == null)
            {
                Debug.LogError("[ThemeManager] Root VisualElement is not initialized. Call Initialize() first.");
                return;
            }
            if (theme == null)
            {
                Debug.LogError("[ThemeManager] ThemeDefinitionSO is null. Cannot apply theme.");
                return;
            }

            // Remove currently active theme stylesheets
            foreach (var activeSheet in _activeThemeSheets)
            {
                if (activeSheet != null)
                {
                    _rootVisualElement.styleSheets.Remove(activeSheet);
                }
            }
            _activeThemeSheets.Clear();

            // Add new theme stylesheets
            if (theme.ThemeStyleSheets != null)
            {
                foreach (var newSheet in theme.ThemeStyleSheets)
                {
                    if (newSheet != null)
                    {
                        _rootVisualElement.styleSheets.Add(newSheet);
                        _activeThemeSheets.Add(newSheet);
                    }
                }
            }
            Debug.Log($"[ThemeManager] Applied theme: {(theme.name)} with {_activeThemeSheets.Count} stylesheets.");
        }

        public void ApplyThemeByName(string themeName)
        {
            if (string.IsNullOrEmpty(themeName))
            {
                Debug.LogError("[ThemeManager] Theme name cannot be null or empty.");
                return;
            }

            ThemeDefinitionSO themeSO;
            if (_loadedThemes.TryGetValue(themeName, out themeSO))
            {
                 // Theme already loaded
            }
            else
            {
                // Attempt to load from Resources by naming convention
                // Assumes themes are named e.g., "DarkTheme.asset" in a "Resources/Themes" folder
                themeSO = Resources.Load<ThemeDefinitionSO>($"Themes/{themeName}");
                if (themeSO != null)
                {
                    _loadedThemes[themeName] = themeSO; // Cache if loaded
                }
            }


            if (themeSO != null)
            {
                ApplyTheme(themeSO);
            }
            else
            {
                Debug.LogError($"[ThemeManager] ThemeDefinitionSO with name '{themeName}' not found or loaded.");
            }
        }
    }
}