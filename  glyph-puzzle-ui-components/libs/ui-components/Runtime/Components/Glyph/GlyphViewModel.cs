namespace GlyphPuzzle.UI.Components
{
    using UnityEngine;
    using GlyphPuzzle.UI.Core;
    using GlyphPuzzle.UI.Accessibility; // Required for AccessibilityManager and ColorblindMode

    /// <summary>
    /// ViewModel for GlyphElement, handling its visual state and accessibility adaptations.
    /// </summary>
    public class GlyphViewModel : BaseViewModel
    {
        private GlyphData _data;
        public GlyphData Data => _data;

        private Color _displayedColor;
        public Color DisplayedColor
        {
            get => _displayedColor;
            private set
            {
                if (_displayedColor != value)
                {
                    _displayedColor = value;
                    OnPropertyChanged(nameof(DisplayedColor));
                }
            }
        }

        private Texture2D _appliedPattern;
        public Texture2D AppliedPattern
        {
            get => _appliedPattern;
            private set
            {
                if (_appliedPattern != value)
                {
                    _appliedPattern = value;
                    OnPropertyChanged(nameof(AppliedPattern));
                }
            }
        }

        private string _glyphSymbol;
        public string GlyphSymbol
        {
            get => _glyphSymbol;
            private set
            {
                if (_glyphSymbol != value)
                {
                    _glyphSymbol = value;
                    OnPropertyChanged(nameof(GlyphSymbol));
                }
            }
        }

        public GlyphViewModel(GlyphData initialData)
        {
            UpdateGlyphData(initialData);
            // Subscription to AccessibilityManager should happen when bound by a View
        }

        public void UpdateGlyphData(GlyphData newData)
        {
            _data = newData;
            GlyphSymbol = _data?.Symbol;
            UpdateVisuals();
        }

        public void SubscribeToAccessibilityChanges()
        {
            if (AccessibilityManager.Instance != null)
            {
                AccessibilityManager.Instance.OnColorblindModeChanged += OnColorblindModeChanged;
            }
            UpdateVisuals(); // Initial update
        }

        public void UnsubscribeFromAccessibilityChanges()
        {
            if (AccessibilityManager.Instance != null)
            {
                AccessibilityManager.Instance.OnColorblindModeChanged -= OnColorblindModeChanged;
            }
        }

        private void OnColorblindModeChanged(ColorblindMode newMode)
        {
            UpdateVisuals();
        }

        private void UpdateVisuals()
        {
            if (_data == null || AccessibilityManager.Instance == null)
            {
                DisplayedColor = _data?.BaseColor ?? Color.white;
                AppliedPattern = null;
                return;
            }

            // Update Color
            if (AccessibilityManager.Instance.TryGetAdaptedColor(_data.BaseColor, out Color adaptedColor))
            {
                DisplayedColor = adaptedColor;
            }
            else
            {
                DisplayedColor = _data.BaseColor;
            }

            // Update Pattern
            // The PatternIdentifier from GlyphData is used (e.g., "GlyphTypeA", "GlyphTypeB")
            if (AccessibilityManager.Instance.TryGetPatternForIdentifier(_data.PatternIdentifier, out PatternDefinitionSO patternDef))
            {
                AppliedPattern = patternDef.PatternTexture;
                // Optionally, if the pattern itself needs a tint different from DisplayedColor, handle here
                // For now, assume DisplayedColor is the primary visual cue or pattern tint is part of PatternDefinitionSO
            }
            else
            {
                AppliedPattern = null;
            }
        }
    }
}