namespace GlyphWeaver.Client.Core.Interfaces
{
    /// <summary>
    /// Defines a contract for objects that require an explicit initialization step.
    /// This is often used for services or components that need to set up their state
    /// after being instantiated or after their dependencies are resolved.
    /// </summary>
    public interface IInitializable
    {
        /// <summary>
        /// Initializes the object. This method should be called after the object
        /// is created and its dependencies are set.
        /// </summary>
        void Initialize();
    }
}