using System.Collections.Generic;

namespace GlyphPuzzle.UI.Coordinator.State
{
    /// <summary>
    /// Represents the state of the player's interaction with UI-driven tutorials,
    /// managed by CrossScreenStateManager.
    /// Implemented Features: TutorialProgressTracking
    /// </summary>
    [System.Serializable]
    public class TutorialFlowState
    {
        /// <summary>
        /// Identifier of the active tutorial. Null or empty if no tutorial is active.
        /// </summary>
        public string CurrentTutorialId;

        /// <summary>
        /// Current step index within the active tutorial.
        /// Typically 0-indexed.
        /// </summary>
        public int CurrentStepIndex;

        /// <summary>
        /// Set of completed tutorial IDs.
        /// </summary>
        public HashSet<string> CompletedTutorials;

        /// <summary>
        /// Initializes a new instance of the <see cref="TutorialFlowState"/> class.
        /// </summary>
        public TutorialFlowState()
        {
            CurrentTutorialId = string.Empty;
            CurrentStepIndex = 0;
            CompletedTutorials = new HashSet<string>();
        }
        
        /// <summary>
        /// Returns a default initialized TutorialFlowState.
        /// </summary>
        public static TutorialFlowState Default => new TutorialFlowState();
    }
}