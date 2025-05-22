// The PlayerData class is expected to be defined in GlyphWeaver.Client.Infrastructure.DataPersistence
// and is not part of this generation batch. The 'using' statement is anticipatory.
using GlyphWeaver.Client.Infrastructure.DataPersistence; 

namespace GlyphWeaver.Client.Core.Interfaces
{
    /// <summary>
    /// Defines a contract for game components whose state needs to be persisted
    /// to local storage or cloud services and restored from it.
    /// REQ-PDP-002: Facilitates saving and loading of PlayerData.
    /// REQ-PDP-008: Abstract contract for data persistence.
    /// </summary>
    public interface ISaveable
    {
        /// <summary>
        /// Populates the provided PlayerData object with the current state of this component.
        /// </summary>
        /// <param name="data">The PlayerData object to be populated with save data.</param>
        void SaveData(PlayerData data);

        /// <summary>
        /// Restores the state of this component from the provided PlayerData object.
        /// </summary>
        /// <param name="data">The PlayerData object containing the data to load.</param>
        void LoadData(PlayerData data);
    }
}