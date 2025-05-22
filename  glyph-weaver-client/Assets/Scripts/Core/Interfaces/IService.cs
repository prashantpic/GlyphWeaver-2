namespace GlyphWeaver.Client.Core.Interfaces
{
    /// <summary>
    /// Defines a common marker type for game services.
    /// This interface can be used for dependency injection, service location,
    /// or simply to identify service classes within the application architecture.
    /// </summary>
    public interface IService
    {
        // This is a marker interface, so it typically has no members.
        // Specific services can extend this with common service methods if needed.
    }
}