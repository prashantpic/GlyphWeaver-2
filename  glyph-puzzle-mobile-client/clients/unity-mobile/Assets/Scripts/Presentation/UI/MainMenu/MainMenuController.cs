using UnityEngine;
using UnityEngine.UI;
using GlyphPuzzle.Mobile.Core; // For GameManager

namespace GlyphPuzzle.Mobile.Presentation.UI.MainMenu
{
    /// <summary>
    /// Controls the main menu UI elements and flow, adhering to REQ-UIUX-001.
    /// Handles user interactions on the main menu screen and coordinates transitions
    /// to other game states or screens.
    /// </summary>
    public class MainMenuController : MonoBehaviour
    {
        [Header("UI Buttons")]
        [SerializeField] private Button newGameButton;
        [SerializeField] private Button continueButton;
        [SerializeField] private Button leaderboardsButton;
        [SerializeField] private Button settingsButton;
        [SerializeField] private Button storeButton; // As per spec, though not in methods

        [Header("Animation Controller")]
        [SerializeField] private MysticalAnimationController mysticalAnimationController;

        /// <summary>
        /// Unity lifecycle method. Subscribes to button events.
        /// </summary>
        void Start()
        {
            if (newGameButton != null)
                newGameButton.onClick.AddListener(OnNewGameClicked);
            if (continueButton != null)
                continueButton.onClick.AddListener(OnContinueClicked);
            if (leaderboardsButton != null)
                leaderboardsButton.onClick.AddListener(OnLeaderboardsClicked);
            if (settingsButton != null)
                settingsButton.onClick.AddListener(OnSettingsClicked);
            if (storeButton != null)
                 storeButton.onClick.AddListener(OnStoreClicked);


            // Example: Check if continue should be available
            // bool canContinue = PlayerProgressionService.Instance.HasSavedProgress(); // Assuming a progression service
            // if (continueButton != null) continueButton.interactable = canContinue;

            if (mysticalAnimationController != null)
            {
                mysticalAnimationController.PlayIntroAnimation();
                mysticalAnimationController.PlayLoopingAnimation();
            }
        }

        private void OnDestroy()
        {
            // It's good practice to remove listeners if the object can be destroyed while buttons still exist
            // Though for scene-persistent UI that unloads with the scene, it's often not strictly necessary.
            if (newGameButton != null) newGameButton.onClick.RemoveListener(OnNewGameClicked);
            if (continueButton != null) continueButton.onClick.RemoveListener(OnContinueClicked);
            if (leaderboardsButton != null) leaderboardsButton.onClick.RemoveListener(OnLeaderboardsClicked);
            if (settingsButton != null) settingsButton.onClick.RemoveListener(OnSettingsClicked);
            if (storeButton != null) storeButton.onClick.RemoveListener(OnStoreClicked);
        }

        public void OnNewGameClicked()
        {
            Debug.Log("New Game button clicked.");
            // Logic for starting a new game (e.g., reset progress or confirm with player)
            // For now, directly loads level selection, assuming new game flow starts there
            GameManager.Instance.LoadLevelSelection();
        }

        public void OnContinueClicked()
        {
            Debug.Log("Continue button clicked.");
            // Logic for continuing from last saved point
            GameManager.Instance.LoadLevelSelection(); // Or load last played level, etc.
        }

        public void OnLeaderboardsClicked()
        {
            Debug.Log("Leaderboards button clicked.");
            // Logic to show leaderboards UI
            // Example: PlatformServiceManager.Instance.ShowLeaderboardsUI();
            // Or navigate to a specific leaderboards scene/panel
        }

        public void OnSettingsClicked()
        {
            Debug.Log("Settings button clicked.");
            // Logic to show settings UI panel or scene
            // Example: UIManager.Instance.ShowSettingsPanel();
        }
        
        public void OnStoreClicked()
        {
            Debug.Log("Store button clicked.");
            // Logic to navigate to IAP store screen/panel
            // Example: UIManager.Instance.ShowStorePanel();
        }
    }
}