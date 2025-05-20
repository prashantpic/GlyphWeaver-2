namespace GlyphPuzzle.UI.Components
{
    using UnityEngine;
    using UnityEngine.UIElements;
    using GlyphPuzzle.UI.Core; // Required for IBindableElement and BaseViewModel

    /// <summary>
    /// Visual element for displaying a single glyph, with data-driven appearance and accessibility adaptations.
    /// </summary>
    public class GlyphElement : VisualElement, IBindableElement
    {
        public new class UxmlFactory : UxmlFactory<GlyphElement, UxmlTraits> {}
        public new class UxmlTraits : VisualElement.UxmlTraits {}

        private const string UxmlPath = "GlyphElement.uxml"; // Assuming UXML is in the same folder or Resources
        private const string UssPath = "GlyphElement.uss";   // Assuming USS is in the same folder or Resources

        private Image _glyphImage;
        private Label _glyphSymbolLabel;
        private GlyphViewModel _viewModel;

        public GlyphElement()
        {
            // Load UXML. For a package, this might involve AssetDatabase or Resources pathing,
            // or assuming the UXML is in a UIElements Editor folder.
            // For simplicity, let's assume UXML/USS are directly usable or loaded via a helper.
            // VisualTreeAsset asset = Resources.Load<VisualTreeAsset>(UxmlPath.Replace(".uxml","")); // Example
            // if(asset != null) asset.CloneTree(this);
            // else  Debug.LogError($"Could not load UXML for GlyphElement from path: {UxmlPath}");

            // StyleSheets.Add(Resources.Load<StyleSheet>(UssPath.Replace(".uss",""))); // Example

            // For UI Builder compatibility and runtime instantiation if UXML is not auto-loaded by name:
            var visualTree = Resources.Load<VisualTreeAsset>("UI/Components/Glyph/GlyphElement"); // Path in a Resources/UI/Components folder
            if (visualTree != null)
            {
                visualTree.CloneTree(this);
            }
            else
            {
                // Fallback if UXML is not found - create elements manually
                _glyphImage = new Image { name = "glyph-image" };
                _glyphSymbolLabel = new Label { name = "glyph-symbol-label" };
                Add(_glyphImage);
                Add(_glyphSymbolLabel);
                Debug.LogWarning($"GlyphElement UXML not found. Creating fallback elements.");
            }
            
            StyleSheet styleSheet = Resources.Load<StyleSheet>("UI/Components/Glyph/GlyphElement"); // Path in a Resources/UI/Components folder
            if (styleSheet != null)
            {
                styleSheets.Add(styleSheet);
            }


            _glyphImage = this.Q<Image>("glyph-image");
            _glyphSymbolLabel = this.Q<Label>("glyph-symbol-label");

            if (_glyphImage == null) Debug.LogError("GlyphElement: 'glyph-image' Image element not found in UXML.");
            if (_glyphSymbolLabel == null) Debug.LogError("GlyphElement: 'glyph-symbol-label' Label element not found in UXML.");
        }

        public void Bind(BaseViewModel viewModel)
        {
            Unbind(); // Clean up any existing bindings

            if (viewModel is GlyphViewModel glyphVM)
            {
                _viewModel = glyphVM;
                _viewModel.PropertyChanged += OnViewModelPropertyChanged;
                _viewModel.SubscribeToAccessibilityChanges(); // ViewModel handles sub/unsub logic

                UpdateVisuals(); // Initial visual update
            }
            else
            {
                Debug.LogError("GlyphElement: Cannot bind, ViewModel is not of type GlyphViewModel.");
            }
        }

        public void Unbind()
        {
            if (_viewModel != null)
            {
                _viewModel.PropertyChanged -= OnViewModelPropertyChanged;
                _viewModel.UnsubscribeFromAccessibilityChanges();
                _viewModel = null;
            }
        }

        private void OnViewModelPropertyChanged(object sender, System.ComponentModel.PropertyChangedEventArgs e)
        {
            UpdateVisuals();
        }

        private void UpdateVisuals()
        {
            if (_viewModel == null) return;

            if (_glyphSymbolLabel != null)
            {
                _glyphSymbolLabel.text = _viewModel.GlyphSymbol;
            }

            // Handle color and pattern. This example applies color to the element's background
            // and pattern to the _glyphImage's background. Adjust as needed.
            // If _glyphImage is meant to show the glyph's base appearance and this VisualElement is a container.
            
            // Option 1: Color the entire element, pattern on the image
            style.backgroundColor = _viewModel.DisplayedColor;

            if (_glyphImage != null)
            {
                _glyphImage.image = _viewModel.AppliedPattern; // Use image for pattern texture
                _glyphImage.style.unityBackgroundImageTintColor = Color.white; // Assuming pattern texture itself has colors or uses tint
                // If the glyph itself is an image that needs tinting by DisplayedColor:
                // _glyphImage.tintColor = _viewModel.DisplayedColor; 
                // If pattern is to be applied as background of the image element
                // _glyphImage.style.backgroundImage = _viewModel.AppliedPattern;
            }
            
            // Option 2: Main image displays color, pattern overlaid or as background
            // if (_glyphImage != null)
            // {
            //    _glyphImage.style.unityBackgroundImageTintColor = _viewModel.DisplayedColor; // If using a white sprite tinted
            //    _glyphImage.style.backgroundImage = _viewModel.AppliedPattern; // Pattern as background
            // }

            MarkDirtyRepaint();
        }
    }
}