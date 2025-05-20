using UnityEngine;
using System;

// Placeholder for IPlatformService and concrete implementations for compilation
#if UNITY_EDITOR && !PLATFORMSERVICEMANAGER_ISERVICE_DEFINED
#define PLATFORMSERVICEMANAGER_ISERVICE_DEFINED
// namespace GlyphPuzzle.Mobile.Infrastructure.PlatformIntegration
// {
//     public interface IPlatformService 
//     {
//         void Initialize(Action<bool> onComplete);
//         void SignIn(Action<bool, string> onComplete);
//         void SubmitScore(string leaderboardId, long score, Action<bool> onComplete);
//         void UnlockAchievement(string achievementId, Action<bool> onComplete);
//         void SaveToCloud(string saveDataJson, Action<bool> onComplete); // Note: spec for manager has saveDataJson, interface has key, data
//         void LoadFromCloud(Action<bool, string> onComplete); // Note: spec for manager has no key, interface has key
//     }
// 
//     // Example dummy implementation
//     public class DummyPlatformService : IPlatformService
//     {
//         public void Initialize(Action<bool> cb) { Debug.Log("DummyPlatformService: Init"); cb?.Invoke(true); }
//         public void SignIn(Action<bool, string> cb) { Debug.Log("DummyPlatformService: SignIn"); cb?.Invoke(true, "DummyUser"); }
//         public void SubmitScore(string l, long s, Action<bool> cb) { Debug.Log($"DummyPlatformService: SubmitScore {s} to {l}"); cb?.Invoke(true); }
//         public void UnlockAchievement(string a, Action<bool> cb) { Debug.Log($"DummyPlatformService: UnlockAchievement {a}"); cb?.Invoke(true); }
//         public void SaveToCloud(string d, Action<bool> cb) { Debug.Log($"DummyPlatformService: SaveToCloud {d}"); cb?.Invoke(true); }
//         public void LoadFromCloud(Action<bool, string> cb) { Debug.Log("DummyPlatformService: LoadFromCloud"); cb?.Invoke(true, "{}"); }
//     }
// }
#endif

namespace GlyphPuzzle.Mobile.Infrastructure.PlatformIntegration
{
    /// <summary>
    /// Manages and provides access to integrated platform services (Game Center, Google Play Games).
    /// Provides a unified C# interface, abstracting platform-specific implementations.
    /// Implements REQ-SCF-001, REQ-SCF-002, REQ-SCF-009, REQ-SCF-011, REQ-PDP-001.
    /// </summary>
    public class PlatformServiceManager : MonoBehaviour // Singleton for easy access
    {
        private static PlatformServiceManager _instance;
        public static PlatformServiceManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<PlatformServiceManager>();
                    if (_instance == null)
                    {
                        GameObject go = new GameObject("PlatformServiceManager");
                        _instance = go.AddComponent<PlatformServiceManager>();
                    }
                }
                return _instance;
            }
        }

        private IPlatformService activePlatformService;
        public bool IsInitialized { get; private set; } = false;

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);

            // Initialize method should be called explicitly, perhaps by GameManager
        }

        /// <summary>
        /// Initializes the appropriate platform service based on the current runtime platform.
        /// </summary>
        public void Initialize()
        {
            if (IsInitialized) return;

            #if UNITY_IOS
                // activePlatformService = new GameCenterService(); // Example
                Debug.Log("PlatformServiceManager: iOS platform detected. GameCenterService would be initialized.");
            #elif UNITY_ANDROID
                // activePlatformService = new GooglePlayGamesService(); // Example
                Debug.Log("PlatformServiceManager: Android platform detected. GooglePlayGamesService would be initialized.");
            #else
                activePlatformService = new DummyPlatformService(); // Fallback for editor or unsupported platforms
                Debug.Log("PlatformServiceManager: Unsupported platform or Editor. Using DummyPlatformService.");
            #endif

            if (activePlatformService != null)
            {
                activePlatformService.Initialize(success =>
                {
                    IsInitialized = success;
                    if (success)
                    {
                        Debug.Log("PlatformServiceManager: Active platform service initialized successfully.");
                    }
                    else
                    {
                        Debug.LogError("PlatformServiceManager: Failed to initialize active platform service.");
                    }
                });
            }
            else
            {
                 Debug.LogError("PlatformServiceManager: No suitable platform service found for the current platform.");
            }
        }

        /// <summary>
        /// Initiates the sign-in process with the platform service.
        /// </summary>
        /// <param name="onComplete">Callback with success status and user ID/error message.</param>
        public void SignIn(Action<bool, string> onComplete)
        {
            if (!IsInitialized || activePlatformService == null)
            {
                Debug.LogError("PlatformServiceManager: Not initialized or no active service. Cannot Sign In.");
                onComplete?.Invoke(false, "Service not initialized.");
                return;
            }
            activePlatformService.SignIn(onComplete);
        }

        /// <summary>
        /// Submits a score to the specified leaderboard.
        /// </summary>
        /// <param name="leaderboardId">The ID of the leaderboard.</param>
        /// <param name="score">The score to submit.</param>
        /// <param name="onComplete">Callback with success status.</param>
        public void SubmitScore(string leaderboardId, long score, Action<bool> onComplete)
        {
            if (!IsInitialized || activePlatformService == null)
            {
                Debug.LogError("PlatformServiceManager: Not initialized or no active service. Cannot Submit Score.");
                onComplete?.Invoke(false);
                return;
            }
            activePlatformService.SubmitScore(leaderboardId, score, onComplete);
        }

        /// <summary>
        /// Unlocks the specified achievement.
        /// </summary>
        /// <param name="achievementId">The ID of the achievement.</param>
        /// <param name="onComplete">Callback with success status.</param>
        public void UnlockAchievement(string achievementId, Action<bool> onComplete)
        {
            if (!IsInitialized || activePlatformService == null)
            {
                Debug.LogError("PlatformServiceManager: Not initialized or no active service. Cannot Unlock Achievement.");
                onComplete?.Invoke(false);
                return;
            }
            activePlatformService.UnlockAchievement(achievementId, onComplete);
        }
        
        // Adapting to IPlatformService which uses key-value for cloud save
        private const string DefaultCloudSaveKey = "GlyphPuzzle_PlayerData";


        /// <summary>
        /// Saves player data to the cloud.
        /// </summary>
        /// <param name="saveDataJson">The player data in JSON format to save.</param>
        /// <param name="onComplete">Callback with success status.</param>
        public void SaveToCloud(string saveDataJson, Action<bool> onComplete)
        {
            if (!IsInitialized || activePlatformService == null)
            {
                Debug.LogError("PlatformServiceManager: Not initialized or no active service. Cannot Save To Cloud.");
                onComplete?.Invoke(false);
                return;
            }
            // The IPlatformService interface has SaveToCloud(string key, string data, ...),
            // but the SDS for PlatformServiceManager.SaveToCloud has (string saveDataJson, ...).
            // Using a default key here for simplicity, or it could be passed in.
            activePlatformService.SaveToCloud(DefaultCloudSaveKey, saveDataJson, onComplete);
        }

        /// <summary>
        /// Loads player data from the cloud.
        /// </summary>
        /// <param name="onComplete">Callback with success status and the loaded JSON data string or error message.</param>
        public void LoadFromCloud(Action<bool, string> onComplete)
        {
            if (!IsInitialized || activePlatformService == null)
            {
                Debug.LogError("PlatformServiceManager: Not initialized or no active service. Cannot Load From Cloud.");
                onComplete?.Invoke(false, "Service not initialized.");
                return;
            }
            // Similar to SaveToCloud, using a default key.
            activePlatformService.LoadFromCloud(DefaultCloudSaveKey, onComplete);
        }
        
        // Expose other IPlatformService methods if needed by the game directly through this facade
        public void ShowLeaderboardUI(string leaderboardId)
        {
            if (!IsInitialized || activePlatformService == null)
            {
                Debug.LogError("PlatformServiceManager: Not initialized. Cannot Show Leaderboard UI.");
                return;
            }
            activePlatformService.ShowLeaderboardUI(leaderboardId);
        }

        public void ShowAchievementsUI()
        {
             if (!IsInitialized || activePlatformService == null)
            {
                Debug.LogError("PlatformServiceManager: Not initialized. Cannot Show Achievements UI.");
                return;
            }
            activePlatformService.ShowAchievementsUI();
        }
        
        public bool IsSignedIn()
        {
            if (!IsInitialized || activePlatformService == null) return false;
            return activePlatformService.IsSignedIn();
        }
        
        public void SignOut()
        {
            if (!IsInitialized || activePlatformService == null) return;
            activePlatformService.SignOut();
        }
    }
}