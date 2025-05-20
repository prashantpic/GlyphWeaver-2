using UnityEngine;
using System.Collections.Generic;

namespace GlyphPuzzle.Mobile.Presentation.UI.MainMenu
{
    /// <summary>
    /// Handles the visual background animations for the main menu.
    /// Uses Unity's animation system (Animator) and/or Particle Systems to create
    /// and manage visual effects for the main menu background.
    /// Implements REQ-UIUX-001.
    /// </summary>
    public class MysticalAnimationController : MonoBehaviour
    {
        [Tooltip("Animator component for background animations.")]
        [SerializeField] private Animator animator;

        [Tooltip("List of particle systems for effects.")]
        [SerializeField] private List<ParticleSystem> particleSystems;

        private const string IntroTriggerName = "PlayIntro";
        private const string LoopStateName = "LoopingAnim"; // Or a trigger "StartLoop"

        void Start()
        {
            // Optionally auto-play on start, or wait for MainMenuController
        }

        /// <summary>
        /// Plays the introductory animation sequence.
        /// </summary>
        public void PlayIntroAnimation()
        {
            if (animator != null && animator.isActiveAndEnabled)
            {
                animator.SetTrigger(IntroTriggerName);
                Debug.Log("MysticalAnimationController: Playing intro animation.");
            }

            // Start any intro particle effects
            foreach (var ps in particleSystems)
            {
                if (ps.gameObject.CompareTag("IntroEffect")) // Example tagging
                {
                    ps.Play();
                }
            }
        }

        /// <summary>
        /// Plays the main looping background animation.
        /// </summary>
        public void PlayLoopingAnimation()
        {
            if (animator != null && animator.isActiveAndEnabled)
            {
                // Assuming the intro animation transitions into a looping state,
                // or you might have a separate trigger/state for looping.
                // For this example, let's assume the Animator graph handles transition to LoopStateName
                // or we could directly play a state: animator.Play(LoopStateName);
                Debug.Log("MysticalAnimationController: Playing looping animation (or ensuring it's active).");
            }

            // Start any looping particle effects
            foreach (var ps in particleSystems)
            {
                 if (ps.gameObject.CompareTag("LoopingEffect") && !ps.isPlaying) // Example tagging
                {
                    ps.Play();
                }
            }
        }

        public void StopAllAnimations()
        {
            if (animator != null && animator.isActiveAndEnabled)
            {
                animator.enabled = false; // Or reset triggers, go to an idle state
                 Debug.Log("MysticalAnimationController: Stopping Animator animations.");
            }
            foreach (var ps in particleSystems)
            {
                ps.Stop();
            }
            Debug.Log("MysticalAnimationController: Stopping all particle effects.");
        }
    }
}