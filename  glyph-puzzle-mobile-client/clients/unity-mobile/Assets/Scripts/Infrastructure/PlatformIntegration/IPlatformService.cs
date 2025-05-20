using System;

namespace GlyphPuzzle.Mobile.Infrastructure.PlatformIntegration
{
    /// <summary>
    /// Interface for platform-specific social and gaming services.
    /// Defines a common contract for implementations like Game Center or Google Play Games.
    /// Implements REQ-SCF-001.
    /// </summary>
    public interface IPlatformService
    {
        /// <summary>
        /// Initializes the platform service.
        /// </summary>
        /// <param name="onComplete">Callback with success status.</param>
        void Initialize(Action<bool> onComplete);

        /// <summary>
        /// Initiates the sign-in process.
        /// </summary>
        /// <param name="onComplete">Callback with success status and user ID string (or error message).</param>
        void SignIn(Action<bool, string> onComplete);

        /// <summary>
        /// Signs out the current user.
        /// </summary>
        void SignOut();

        /// <summary>
        /// Checks if a user is currently signed in.
        /// </summary>
        /// <returns>True if signed in, false otherwise.</returns>
        bool IsSignedIn();

        /// <summary>
        /// Submits a score to a leaderboard.
        /// </summary>
        /// <param name="leaderboardId">The ID of the leaderboard.</param>
        /// <param name="score">The score to submit.</param>
        /// <param name="onComplete">Callback with success status.</param>
        void SubmitScore(string leaderboardId, long score, Action<bool> onComplete);

        /// <summary>
        /// Shows the platform's default UI for a specific leaderboard.
        /// </summary>
        /// <param name="leaderboardId">The ID of the leaderboard to show.</param>
        void ShowLeaderboardUI(string leaderboardId);

        /// <summary>
        /// Unlocks an achievement.
        /// </summary>
        /// <param name="achievementId">The ID of the achievement.</param>
        /// <param name="onComplete">Callback with success status.</param>
        void UnlockAchievement(string achievementId, Action<bool> onComplete);

        /// <summary>
        /// Shows the platform's default UI for achievements.
        /// </summary>
        void ShowAchievementsUI();

        /// <summary>
        /// Saves data to the cloud.
        /// </summary>
        /// <param name="key">The key to associate with the data.</param>
        /// <param name="data">The string data to save (e.g., JSON).</param>
        /// <param name="onComplete">Callback with success status.</param>
        void SaveToCloud(string key, string data, Action<bool> onComplete);

        /// <summary>
        /// Loads data from the cloud.
        /// </summary>
        /// <param name="key">The key of the data to load.</param>
        /// <param name="onComplete">Callback with success status and the loaded data string (or error message).</param>
        void LoadFromCloud(string key, Action<bool, string> onComplete);
    }

    // Example Dummy Implementation (can be in its own file or used for testing)
    public class DummyPlatformService : IPlatformService
    {
        private bool _isSignedIn = false;
        private string _userId = "DummyPlayer123";

        public void Initialize(Action<bool> onComplete) 
        { 
            UnityEngine.Debug.Log("[DummyPlatformService] Initialized.");
            onComplete?.Invoke(true); 
        }
        public void SignIn(Action<bool, string> onComplete) 
        { 
            _isSignedIn = true;
            UnityEngine.Debug.Log($"[DummyPlatformService] SignedIn as {_userId}.");
            onComplete?.Invoke(true, _userId); 
        }
        public void SignOut() 
        { 
            _isSignedIn = false;
            UnityEngine.Debug.Log("[DummyPlatformService] SignedOut.");
        }
        public bool IsSignedIn() { return _isSignedIn; }
        public void SubmitScore(string l, long s, Action<bool> c) { UnityEngine.Debug.Log($"[DummyPlatformService] Score {s} submitted to {l}."); c?.Invoke(true); }
        public void ShowLeaderboardUI(string l) { UnityEngine.Debug.Log($"[DummyPlatformService] Showing Leaderboard UI for {l}."); }
        public void UnlockAchievement(string a, Action<bool> c) { UnityEngine.Debug.Log($"[DummyPlatformService] Achievement {a} unlocked."); c?.Invoke(true); }
        public void ShowAchievementsUI() { UnityEngine.Debug.Log("[DummyPlatformService] Showing Achievements UI."); }
        public void SaveToCloud(string k, string d, Action<bool> c) { UnityEngine.Debug.Log($"[DummyPlatformService] Data saved to cloud for key {k}: {d.Substring(0, Math.Min(d.Length, 50))}"); c?.Invoke(true); }
        public void LoadFromCloud(string k, Action<bool, string> c) { UnityEngine.Debug.Log($"[DummyPlatformService] Data loaded from cloud for key {k}."); c?.Invoke(true, "{\"message\":\"Dummy Cloud Data\"}"); }
    }
}