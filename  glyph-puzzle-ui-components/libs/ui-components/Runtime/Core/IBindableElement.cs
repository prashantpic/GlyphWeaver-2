namespace GlyphPuzzle.UI.Core
{
    /// <summary>
    /// Interface for UI elements supporting ViewModel data binding.
    /// Defines methods `Bind` to link a ViewModel to a UI element and `Unbind` to detach it,
    /// managing the lifecycle of the binding.
    /// </summary>
    public interface IBindableElement
    {
        /// <summary>
        /// Binds the UI element to the specified ViewModel.
        /// </summary>
        /// <param name="viewModel">The ViewModel to bind to.</param>
        void Bind(BaseViewModel viewModel);

        /// <summary>
        /// Unbinds the UI element from its current ViewModel.
        /// </summary>
        void Unbind();
    }
}