namespace GlyphPuzzle.UI.Components
{
    using UnityEngine;
    using GlyphPuzzle.UI.Core;
    using GlyphPuzzle.UI.Accessibility; // Required for AccessibilityManager

    public class PathSegmentData // Simple data holder for original path segment properties
    {
        public string SegmentId { get; }
        public Color OriginalColor { get; }
        public string PatternIdentifier { get; } // Used to look up patterns

        public PathSegmentData(string segmentId, Color originalColor, string patternIdentifier)
        {
            SegmentId = segmentId;
            OriginalColor = originalColor;
            PatternIdentifier = patternIdentifier;
        }
    }

    /// <summary>
    /// ViewModel for PathSegmentElement, handling visual state and accessibility.
    /// </summary>
    public class PathSegmentViewModel : BaseViewModel
    {
        private PathSegmentData _data;
        public PathSegmentData Data => _data;

        private Color _pathColor;
        public Color PathColor
        {
            get => _pathColor;
            private set
            {
                if (_pathColor != value)
                {
                    _pathColor = value;
                    OnPropertyChanged(nameof(PathColor));
                }
            }
        }

        private Texture2D _pathPattern;
        public Texture2D PathPattern
        {
            get => _pathPattern;
            private set
            {
                if (_pathPattern != value)
                {
                    _pathPattern = value;
                    OnPropertyChanged(nameof(PathPattern));
                }
            }
        }

        public PathSegmentViewModel(PathSegmentData initialData)
        {
            UpdatePathSegmentData(initialData);
            // Subscription to AccessibilityManager should happen when bound by a View
        }
        
        public void UpdatePathSegmentData(PathSegmentData newData)
        {
            _data = newData;
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
                PathColor = _data?.OriginalColor ?? Color.gray;
                PathPattern = null;
                return;
            }

            if (AccessibilityManager.Instance.TryGetAdaptedColor(_data.OriginalColor, out Color adaptedColor))
            {
                PathColor = adaptedColor;
            }
            else
            {
                PathColor = _data.OriginalColor;
            }

            if (AccessibilityManager.Instance.TryGetPatternForIdentifier(_data.PatternIdentifier, out PatternDefinitionSO patternDef))
            {
                PathPattern = patternDef.PatternTexture;
            }
            else
            {
                PathPattern = null;
            }
        }
    }
}