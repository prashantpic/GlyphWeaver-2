using UnityEngine;
using System.Collections.Generic;

namespace GlyphPuzzle.Mobile.Presentation.Feedback
{
    /// <summary>
    /// Handles visual feedback for gameplay events.
    /// Triggers animations or particle effects for actions like valid connections or invalid moves.
    /// Implements REQ-CGLE-016, REQ-UIUX-004.
    /// </summary>
    public class VisualFeedbackManager : MonoBehaviour
    {
        [Header("Feedback Prefabs")]
        [Tooltip("Prefab for visual effect on a valid move/connection.")]
        [SerializeField] private GameObject validMoveEffectPrefab;

        [Tooltip("Prefab for visual effect on an invalid move attempt.")]
        [SerializeField] private GameObject invalidMoveEffectPrefab;

        [Header("Effect Parameters")]
        [Tooltip("Duration for which feedback effects are shown before being destroyed.")]
        [SerializeField] private float effectDuration = 1.0f;

        // Could be a MonoBehaviour Singleton for easy access, or injected/found.
        // public static VisualFeedbackManager Instance { get; private set; }
        // void Awake()
        // {
        //     if (Instance == null) Instance = this;
        //     else Destroy(gameObject);
        // }

        /// <summary>
        /// Plays visual feedback for a successfully completed path or connection.
        /// </summary>
        /// <param name="pathCells">The grid cells that form the valid path/connection.</param>
        /// <param name="worldOffset">Optional offset if cell positions are not world positions.</param>
        public void PlayValidConnectionFeedback(List<Vector2Int> pathCells, Vector3 worldOffset = default)
        {
            if (validMoveEffectPrefab == null || pathCells == null || pathCells.Count == 0) return;

            // Example: Instantiate effect at the center of the path or on each cell
            foreach (Vector2Int cellPos in pathCells)
            {
                // Assuming cellPos needs conversion to world position
                Vector3 worldPos = new Vector3(cellPos.x, cellPos.y, 0) + worldOffset; // Adjust Z as needed
                InstantiateAndDestroyEffect(validMoveEffectPrefab, worldPos);
            }
            Debug.Log("VisualFeedbackManager: Playing valid connection feedback.");
        }
        
        /// <summary>
        /// Plays visual feedback for an invalid move attempt at a specific cell.
        /// </summary>
        /// <param name="cellPosition">The grid cell where the invalid move occurred.</param>
        /// <param name="worldOffset">Optional offset if cell position is not world position.</param>
        public void PlayInvalidMoveFeedback(Vector2Int cellPosition, Vector3 worldOffset = default)
        {
            if (invalidMoveEffectPrefab == null) return;

            // Assuming cellPos needs conversion to world position
            Vector3 worldPos = new Vector3(cellPosition.x, cellPosition.y, 0) + worldOffset; // Adjust Z as needed
            InstantiateAndDestroyEffect(invalidMoveEffectPrefab, worldPos);
            Debug.Log($"VisualFeedbackManager: Playing invalid move feedback at {cellPosition}.");
        }
        
        /// <summary>
        /// Plays a generic visual effect at a specified world position.
        /// </summary>
        /// <param name="effectPrefab">The prefab of the effect to play.</param>
        /// <param name="worldPosition">The world position to instantiate the effect.</param>
        public void PlayEffectAt(GameObject effectPrefab, Vector3 worldPosition)
        {
            if (effectPrefab == null) return;
            InstantiateAndDestroyEffect(effectPrefab, worldPosition);
        }


        private void InstantiateAndDestroyEffect(GameObject prefab, Vector3 position)
        {
            GameObject effectInstance = Instantiate(prefab, position, Quaternion.identity, transform); // Parent to manager for organization
            Destroy(effectInstance, effectDuration);
        }
    }
}