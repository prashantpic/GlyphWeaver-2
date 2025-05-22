// Forward declaration for PlayerData - actual definition will be in Infrastructure
// namespace GlyphWeaver.Client.Infrastructure.DataPersistence { public class PlayerData {} }

namespace GlyphWeaver.Client.Core.Interfaces
{
    // Assuming PlayerData will be defined in GlyphWeaver.Client.Infrastructure.DataPersistence
    // If it's defined in a shared assembly, adjust the using directive.
    // For now, the type name 'PlayerData' will be used directly.
    // using GlyphWeaver.Client.Infrastructure.DataPersistence; 

    /// <summary>
    /// Defines a contract for components whose state needs to be persisted and restored.
    /// This interface is typically used by a data repository to manage saving and loading
    /// of game progress, settings, or other persistent data.
    /// REQ-PDP-002: Player data persistence.
    /// REQ-PDP-008: Local player data persistence (SQLite/PlayerPrefs).
    /// </summary>
    public interface ISaveable<TPlayerData> where TPlayerData : class // Or struct, depending on PlayerData definition
    {
        /// <summary>
        /// Populates the provided data container with the current state of this component.
        /// </summary>
        /// <param name="data">The player data container to save state into.</param>
        void SaveData(TPlayerData data);

        /// <summary>
        /// Restores the state of this component from the provided data container.
        /// </summary>
        /// <param name="data">The player data container to load state from.</param>
        void LoadData(TPlayerData data);
    }
}