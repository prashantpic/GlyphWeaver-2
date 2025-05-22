namespace GlyphWeaver.Client.Core.Interfaces
{
    /// <summary>
    /// Defines a contract for objects that require an explicit initialization step
    /// after their creation or after all dependencies have been resolved.
    /// </summary>
    public interface IInitializable
    {
        /// <summary>
        /// Initializes the component. This method is typically called once
        /// after the object is created and its dependencies are set.
        /// </summary>
        void Initialize();
    }
}