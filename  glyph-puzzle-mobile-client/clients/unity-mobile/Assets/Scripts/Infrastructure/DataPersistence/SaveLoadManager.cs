using UnityEngine;
using System.IO;
using GlyphPuzzle.Mobile.DomainLogic.Models; // For PlayerData
using GlyphPuzzle.Mobile.Core;             // For GameConstants

namespace GlyphPuzzle.Mobile.Infrastructure.DataPersistence
{
    /// <summary>
    /// Manages all local save and load operations for player data and settings.
    /// Implements REQ-CGLE-001, REQ-ACC-001, REQ-ACC-010, REQ-PDP-008.
    /// Uses JSON serialization to persistent data path.
    /// </summary>
    public static class SaveLoadManager
    {
        private static string GetSavePath()
        {
            return Path.Combine(Application.persistentDataPath, "playerData.json");
        }
        
        private static string GetBackupSavePath()
        {
            return Path.Combine(Application.persistentDataPath, "playerData.json.bak");
        }


        /// <summary>
        /// Saves the player's data to local persistent storage. (REQ-PDP-008)
        /// Implements atomic write by saving to a temp file then renaming.
        /// </summary>
        /// <param name="playerData">The PlayerData object to save.</param>
        public static void SavePlayerData(PlayerData playerData)
        {
            if (playerData == null)
            {
                Debug.LogError("SaveLoadManager: Attempted to save null PlayerData.");
                return;
            }

            string json = JsonUtility.ToJson(playerData, true); // Use 'true' for pretty print if desired for debugging
            string path = GetSavePath();
            string backupPath = GetBackupSavePath();
            string tempPath = path + ".tmp";

            try
            {
                // Write to a temporary file first
                File.WriteAllText(tempPath, json);

                // If write is successful, create a backup of the old save file (if it exists)
                if (File.Exists(path))
                {
                    File.Replace(tempPath, path, backupPath); // Atomic replace if possible, otherwise creates backup
                }
                else
                {
                    File.Move(tempPath, path); // If no original, just move temp to be the main save
                }
                
                Debug.Log($"Player data saved to {path}");
            }
            catch (System.Exception e)
            {
                Debug.LogError($"SaveLoadManager: Failed to save player data to {path}. Error: {e.Message}");
                // Attempt to delete temp file if it still exists to prevent partial save issues
                if (File.Exists(tempPath))
                {
                    try { File.Delete(tempPath); } catch { /* best effort */ }
                }
            }
        }

        /// <summary>
        /// Loads player data from local persistent storage.
        /// Attempts to load from main path, then backup path if main fails or is corrupt.
        /// </summary>
        /// <returns>The loaded PlayerData object, or null if no data found or error occurs.</returns>
        public static PlayerData LoadPlayerData()
        {
            string path = GetSavePath();
            string backupPath = GetBackupSavePath();
            PlayerData loadedData = null;

            if (File.Exists(path))
            {
                try
                {
                    string json = File.ReadAllText(path);
                    loadedData = JsonUtility.FromJson<PlayerData>(json);
                    if (loadedData != null)
                    {
                         Debug.Log($"Player data loaded from {path}");
                         return loadedData;
                    }
                    else
                    {
                        Debug.LogWarning($"SaveLoadManager: Failed to parse PlayerData from {path}. Attempting backup.");
                    }
                }
                catch (System.Exception e)
                {
                    Debug.LogWarning($"SaveLoadManager: Error loading player data from {path}. Error: {e.Message}. Attempting backup.");
                }
            }
            
            // If main file doesn't exist or failed to load, try backup
            if (File.Exists(backupPath))
            {
                Debug.LogWarning($"SaveLoadManager: Attempting to load from backup file {backupPath}.");
                try
                {
                    string json = File.ReadAllText(backupPath);
                    loadedData = JsonUtility.FromJson<PlayerData>(json);
                     if (loadedData != null)
                    {
                        Debug.Log($"Player data successfully loaded from backup {backupPath}. Restoring main save file.");
                        // Restore main save file from backup
                        File.Copy(backupPath, path, true);
                        return loadedData;
                    }
                    else
                    {
                         Debug.LogError($"SaveLoadManager: Failed to parse PlayerData from backup {backupPath}. Corrupted backup.");
                    }
                }
                catch (System.Exception e)
                {
                    Debug.LogError($"SaveLoadManager: Error loading player data from backup {backupPath}. Error: {e.Message}");
                }
            }


            if (loadedData == null)
            {
                 Debug.Log("SaveLoadManager: No player data found or loaded. A new PlayerData will be created.");
            }
            return loadedData; // Returns null if no valid data could be loaded
        }

        /// <summary>
        /// Clears all saved player data from local storage.
        /// </summary>
        public static void ClearPlayerData()
        {
            string path = GetSavePath();
            string backupPath = GetBackupSavePath();
            try
            {
                if (File.Exists(path))
                {
                    File.Delete(path);
                    Debug.Log($"Player data file deleted from {path}");
                }
                if (File.Exists(backupPath))
                {
                    File.Delete(backupPath);
                    Debug.Log($"Player data backup file deleted from {backupPath}");
                }
            }
            catch (System.Exception e)
            {
                Debug.LogError($"SaveLoadManager: Error clearing player data. Error: {e.Message}");
            }
        }
    }
}