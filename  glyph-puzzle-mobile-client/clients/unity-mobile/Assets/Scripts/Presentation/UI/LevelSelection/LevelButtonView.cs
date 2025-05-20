using UnityEngine;
using UnityEngine.UI;
using TMPro;
using GlyphPuzzle.Mobile.Core; // For GameManager
using GlyphPuzzle.Mobile.DomainLogic.Data.Levels; // For LevelDefinitionSO
using GlyphPuzzle.Mobile.DomainLogic.Models;    // For LevelProgressionData

// Placeholder for StarRatingView if not defined elsewhere
#if UNITY_EDITOR // To avoid duplicate definition errors
// namespace GlyphPuzzle.Mobile.Presentation.UI.LevelSelection
// {
//     public class StarRatingView : MonoBehaviour 
//     { 
//         public void SetStars(int count) { /* TODO: Implement star display logic */ } 
//     }
// }
#endif

namespace GlyphPuzzle.Mobile.Presentation.UI.LevelSelection
{
    /// <summary>
    /// Represents a single level button in the UI.
    /// Updates its appearance based on LevelData and PlayerProgressionData.
    /// Handles selection to load the level.
    /// Implements REQ-UIUX-002, REQ-CGLE-001.
    /// </summary>
    public class LevelButtonView : MonoBehaviour
    {
        [Header("UI Elements")]
        [SerializeField] private TextMeshProUGUI levelNameText;
        [SerializeField] private Button levelButton;
        [SerializeField] private GameObject lockIcon;
        [SerializeField] private StarRatingView starRatingDisplay; // REQ-UIUX-002

        private LevelDefinitionSO levelDefinition;
        private bool isLocked;

        /// <summary>
        /// Initializes the level button with its definition, progress, and lock status.
        /// </summary>
        /// <param name="levelDef">The static definition of the level.</param>
        /// <param name="progressData">The player's progress for this level.</param>
        /// <param name="isLockedStatus">Whether the level is currently locked.</param>
        public void Initialize(LevelDefinitionSO levelDef, LevelProgressionData progressData, bool isLockedStatus)
        {
            this.levelDefinition = levelDef;
            this.isLocked = isLockedStatus;

            if (levelDef == null)
            {
                Debug.LogError("LevelButtonView: LevelDefinitionSO is null.");
                gameObject.SetActive(false);
                return;
            }

            if (levelNameText != null)
            {
                // levelNameText.text = LocalizationService.GetString(levelDef.LevelNameKey); // Assuming LevelNameKey
                levelNameText.text = levelDef.LevelId; // Placeholder if no specific name key
            }

            if (levelButton != null)
            {
                levelButton.interactable = !this.isLocked;
                levelButton.onClick.RemoveAllListeners(); // Clear previous listeners
                if (!this.isLocked)
                {
                    levelButton.onClick.AddListener(OnLevelSelected);
                }
            }

            if (lockIcon != null)
            {
                lockIcon.SetActive(this.isLocked);
            }

            if (starRatingDisplay != null) // REQ-UIUX-002
            {
                if (this.isLocked || progressData == null)
                {
                    starRatingDisplay.gameObject.SetActive(false);
                }
                else
                {
                    starRatingDisplay.gameObject.SetActive(true);
                    // starRatingDisplay.SetStars(progressData.StarsEarned);
                }
            }
        }

        /// <summary>
        /// Called when the level button is clicked.
        /// </summary>
        public void OnLevelSelected()
        {
            if (isLocked || levelDefinition == null)
            {
                Debug.LogWarning($"Attempted to select a locked or undefined level: {levelDefinition?.LevelId}");
                return;
            }

            Debug.Log($"Level selected: {levelDefinition.LevelId}");
            GameManager.Instance.LoadGameplayLevel(levelDefinition.LevelId);
        }
    }
}