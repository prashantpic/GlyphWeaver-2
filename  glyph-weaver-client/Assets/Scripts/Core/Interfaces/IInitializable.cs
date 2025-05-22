namespace GlyphWeaver.Client.Core.Interfaces
{
    /// <summary>
    /// Defines a contract for objects that require an explicit initialization step
    /// after their creation or loading. This is often used for services or components
    /// that have dependencies or setup logic that cannot be handled in their constructor.
    /// </summary>
    public interface IInitializable
    {
        /// <summary>
        /// Initializes the object. This method should be called once all dependencies
        /// are resolved and before the object is actively used.
        /// </summary>
        void Initialize();
    }
}