using UnityEngine;
using UnityEngine.SceneManagement;

namespace GlyphPuzzle.Mobile.Core.Enums // For GameState
{
    public enum GameState
    {
        Initializing,
        MainMenu,
        LevelSelection,
        LoadingLevel,
        Gameplay,
        Paused,
        GameOver
    }
}

namespace GlyphPuzzle.Mobile.Core
{
    /// <summary>
    /// Manages the overall game lifecycle and state.
    /// Acts as the central coordination point for the game, managing game flow and global state.
    /// Implements Singleton and Facade patterns.
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        private static GameManager _instance;
        public static GameManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<GameManager>();
                    if (_instance == null)
                    {
                        GameObject singletonObject = new GameObject("GameManager");
                        _instance = singletonObject.AddComponent<GameManager>();
                    }
                }
                return _instance;
            }
        }

        public GameState CurrentGameState { get; private set; }

        // Example: Service references needed globally, initialized here or by a bootstrapper.
        // public PlayerProgressionService PlayerProgressionService { get; private set; }
        // public SettingsManager SettingsManager { get; private set; }


        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeCoreSystems();
        }

        private void Start()
        {
            // After core systems are initialized, usually transition to the main menu
            // Or load initial player data etc.
            if (SceneManager.GetActiveScene().name == "Boot") // Assuming a Boot scene
            {
                 LoadMainMenu();
            }
        }
        
        private void InitializeCoreSystems()
        {
            CurrentGameState = GameState.Initializing;
            Debug.Log("GameManager: Initializing core systems...");

            // Example: Initialize services
            // PlayerProgressionService = new PlayerProgressionService();
            // PlayerProgressionService.LoadProgression(); // Assuming a load method

            // SettingsManager = new SettingsManager();
            // SettingsManager.LoadSettings();

            // Initialize other managers or services (Audio, Platform Integration etc.)
            // AudioManager.Instance.Initialize(); // Example call if AudioManager has an Initialize
            // PlatformServiceManager.Instance.Initialize(); // Example

            Debug.Log("GameManager: Core systems initialized.");
            CurrentGameState = GameState.MainMenu; // Or based on initial scene logic
        }

        /// <summary>
        /// Loads the Main Menu scene.
        /// </summary>
        public void LoadMainMenu()
        {
            CurrentGameState = GameState.LoadingLevel; // Or a specific state like "LoadingMainMenu"
            SceneManager.LoadScene(GameConstants.MainMenuSceneName);
            // Consider using SceneManager.sceneLoaded event to set CurrentGameState = GameState.MainMenu;
            // For simplicity, we might set it after LoadSceneAsync completes or directly if transitions are quick.
            // CurrentGameState = GameState.MainMenu; // This might be premature if loading is async
        }

        /// <summary>
        /// Loads the Level Selection scene.
        /// </summary>
        public void LoadLevelSelection()
        {
            CurrentGameState = GameState.LoadingLevel;
            SceneManager.LoadScene(GameConstants.LevelSelectionSceneName);
            // CurrentGameState = GameState.LevelSelection;
        }

        /// <summary>
        /// Loads a specific gameplay level.
        /// </summary>
        /// <param name="levelId">The unique identifier of the level to load.</param>
        public void LoadGameplayLevel(string levelId)
        {
            CurrentGameState = GameState.LoadingLevel;
            // Store the levelId somewhere accessible for the Gameplay scene to load, e.g., a static variable or a service
            // CurrentLevelService.SelectedLevelId = levelId; (Example)
            Debug.Log($"GameManager: Loading gameplay level - {levelId}");
            SceneManager.LoadScene(GameConstants.GameplaySceneName);
            // CurrentGameState = GameState.Gameplay;
        }

        // Example of handling scene loaded event
        private void OnEnable()
        {
            SceneManager.sceneLoaded += OnSceneLoaded;
        }

        private void OnDisable()
        {
            SceneManager.sceneLoaded -= OnSceneLoaded;
        }

        void OnSceneLoaded(Scene scene, LoadSceneMode mode)
        {
            if (scene.name == GameConstants.MainMenuSceneName)
            {
                CurrentGameState = GameState.MainMenu;
            }
            else if (scene.name == GameConstants.LevelSelectionSceneName)
            {
                CurrentGameState = GameState.LevelSelection;
            }
            else if (scene.name == GameConstants.GameplaySceneName)
            {
                CurrentGameState = GameState.Gameplay;
                // Additional setup for gameplay scene can happen here
            }
            Debug.Log($"Scene Loaded: {scene.name}. Current Game State: {CurrentGameState}");
        }


        public void PauseGame()
        {
            if (CurrentGameState == GameState.Gameplay)
            {
                CurrentGameState = GameState.Paused;
                Time.timeScale = 0f; // Pause game time
                // Show pause menu, etc.
                Debug.Log("Game Paused");
            }
        }

        public void ResumeGame()
        {
            if (CurrentGameState == GameState.Paused)
            {
                CurrentGameState = GameState.Gameplay;
                Time.timeScale = 1f; // Resume game time
                // Hide pause menu, etc.
                Debug.Log("Game Resumed");
            }
        }

        public void QuitApplication()
        {
            Debug.Log("Quitting application...");
            Application.Quit();
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false; // Stop playing in editor
#endif
        }
    }
}