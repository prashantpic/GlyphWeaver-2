// Assuming PlayerData will be defined in GlyphWeaver.Client.Infrastructure.DataPersistence
// or a shared assembly. For now, we'll declare it in a placeholder way if not found.
#if !GLYPHWEAVER_PLAYERDATA_DEFINED
// Placeholder for PlayerData if not yet defined.
// In a real project, PlayerData would be in its own file and assembly.
namespace GlyphWeaver.Client.Infrastructure.DataPersistence
{
    public class PlayerData { /* Placeholder properties */ }
}
#define GLYPHWEAVER_PLAYERDATA_DEFINED
#endif

using GlyphWeaver.Client.Infrastructure.DataPersistence;

namespace GlyphWeaver.Client.Core.Interfaces
{
    /// <summary>
    /// Defines a contract for components whose state needs to be persisted and restored.
    /// This interface is typically used by a data management system (e.g., LocalDataRepository)
    /// to gather data for saving or to apply loaded data.
    /// REQ-PDP-002: Player progress is saved.
    /// REQ-PDP-008: Sensitive local data might be encrypted by the repository before saving.
    /// ComponentId: LocalDataRepository (This interface is used by components that interact with it)
    /// </summary>
    public interface ISaveable
    {
        /// <summary>
        /// Populates the provided PlayerData object with the component's current state
        /// that needs to be saved.
        /// </summary>
        /// <param name="data">The PlayerData object to populate. This object is typically
        /// managed by the saving system and passed to all ISaveable components.</param>
        void SaveData(PlayerData data);

        /// <summary>
        /// Restores the component's state from the provided PlayerData object.
        /// This method is called after data has been loaded.
        /// </summary>
        /// <param name="data">The PlayerData object containing the state to load.
        /// This object is typically managed by the loading system.</param>
        void LoadData(PlayerData data);
    }
}