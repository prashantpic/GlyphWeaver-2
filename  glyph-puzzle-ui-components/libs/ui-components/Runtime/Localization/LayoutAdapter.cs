namespace GlyphPuzzle.UI.Localization
{
    using UnityEngine.UIElements;

    /// <summary>
    /// Helps UI elements adapt their layout to dynamic content sizes, particularly for localized text.
    /// </summary>
    public static class LayoutAdapter
    {
        /// <summary>
        /// Adapts the layout of a TextElement or its parent to accommodate its current text content.
        /// </summary>
        /// <param name="textElement">The TextElement whose content may have changed.</param>
        public static void AdaptLayoutToTextContent(TextElement textElement)
        {
            if (textElement == null) return;

            // Option 1: Mark the element itself dirty for repaint and relayout.
            // This is often enough if the element's size is set to auto or uses flexbox correctly.
            textElement.MarkDirtyRepaint();

            // Option 2: If the TextElement is inside a container that needs to resize,
            // mark the parent dirty.
            if (textElement.parent != null)
            {
                textElement.parent.MarkDirtyRepaint();
            }

            // Option 3: More complex scenarios might involve directly adjusting style properties.
            // For example, if you need to switch between text wrapping modes or adjust max width.
            // This requires careful consideration of the specific layout requirements.
            // e.g., textElement.style.whiteSpace = WhiteSpace.Normal; // to enable wrapping
            // e.g., textElement.style.maxWidth = new StyleLength(StyleKeyword.None); // to allow expand

            // Generally, UI Toolkit's layout engine should handle most cases if USS is set up for flexibility.
            // This method serves as a hook if explicit intervention is needed.
        }
    }
}