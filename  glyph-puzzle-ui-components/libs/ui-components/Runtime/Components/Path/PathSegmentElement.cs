namespace GlyphPuzzle.UI.Components
{
    using UnityEngine;
    using UnityEngine.UIElements;
    using GlyphPuzzle.UI.Core;

    /// <summary>
    /// Visual element for displaying a path segment, with accessibility adaptations.
    /// </summary>
    public class PathSegmentElement : VisualElement, IBindableElement
    {
        public new class UxmlFactory : UxmlFactory<PathSegmentElement, UxmlTraits> {}
        public new class UxmlTraits : VisualElement.UxmlTraits {}

        // Path segments might not need complex UXML if they are simple styled rects or custom drawn.
        // For simplicity, let's assume it's a simple VisualElement styled by USS and C#.
        // private const string UssPath = "PathSegmentElement.uss";

        private PathSegmentViewModel _viewModel;

        public PathSegmentElement()
        {
            // StyleSheets.Add(Resources.Load<StyleSheet>(UssPath.Replace(".uss", ""))); // Example USS loading

            StyleSheet styleSheet = Resources.Load<StyleSheet>("UI/Components/Path/PathSegmentElement"); // Path in a Resources/UI/Components folder
            if (styleSheet != null)
            {
                styleSheets.Add(styleSheet);
            }
            else
            {
                 // Apply some default styles if USS fails to load
                style.width = 20;
                style.height = 10;
                style.backgroundColor = Color.gray;
            }
            // For custom drawing, you would typically override GenerateVisualContent
            // generateVisualContent += OnGenerateVisualContent;
        }

        public void Bind(BaseViewModel viewModel)
        {
            Unbind();

            if (viewModel is PathSegmentViewModel pathVM)
            {
                _viewModel = pathVM;
                _viewModel.PropertyChanged += OnViewModelPropertyChanged;
                _viewModel.SubscribeToAccessibilityChanges();
                UpdateVisuals();
            }
            else
            {
                Debug.LogError("PathSegmentElement: Cannot bind, ViewModel is not of type PathSegmentViewModel.");
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

            style.backgroundColor = _viewModel.PathColor;
            style.backgroundImage = _viewModel.PathPattern;
            
            if(_viewModel.PathPattern != null)
            {
                // Ensure tint color for pattern is appropriate, default white means texture colors are used as is.
                style.unityBackgroundImageTintColor = Color.white; 
            }

            MarkDirtyRepaint();
        }

        // Example for custom drawing if needed later:
        // private void OnGenerateVisualContent(MeshGenerationContext mgc)
        // {
        //     if (_viewModel == null) return;
        //
        //     var painter = mgc.painter2D;
        //     painter.fillColor = _viewModel.PathColor;
        //     // painter.strokeColor = ...;
        //     // Draw custom path shape, e.g., painter.BeginPath(); painter.LineTo(...); painter.Fill();
        //     painter.DrawRectangle(contentRect); // Simple rectangle example
        // }
    }
}