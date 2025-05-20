using GlyphPuzzle.UI.Coordinator.Interfaces;
using System;
using System.Threading.Tasks;
using UnityEngine.UIElements;
using DG.Tweening; // DOTween Core
using UnityEngine; // For Debug

namespace GlyphPuzzle.UI.Coordinator.Services
{
    /// <summary>
    /// Provides a centralized service for common UI animations using DOTween,
    /// respecting the reduced motion setting.
    /// </summary>
    public class SharedAnimationService : ISharedAnimationService
    {
        private readonly IMasterAccessibilityService _masterAccessibilityService;
        private const float ReducedMotionDurationFactor = 0.1f; // Drastically reduce duration for reduced motion
        private const float InstantDuration = 0.001f; // Effectively instant for reduced motion skips

        /// <summary>
        /// Initializes a new instance of the <see cref="SharedAnimationService"/> class.
        /// </summary>
        /// <param name="masterAccessibilityService">The master accessibility service dependency.</param>
        public SharedAnimationService(IMasterAccessibilityService masterAccessibilityService)
        {
            _masterAccessibilityService = masterAccessibilityService ?? throw new ArgumentNullException(nameof(masterAccessibilityService));
        }

        private bool ShouldReduceMotion() => _masterAccessibilityService.IsReducedMotionEnabled();

        /// <summary>
        /// Animates the opacity of the element from 0 to 1.
        /// Respects reduced motion settings.
        /// </summary>
        /// <param name="element">The visual element to animate.</param>
        /// <param name="duration">The duration of the animation if not reduced.</param>
        /// <param name="delay">Optional delay before starting the animation.</param>
        /// <returns>A <see cref="Task"/> representing the asynchronous animation.</returns>
        public async Task FadeInAsync(VisualElement element, float duration, float delay = 0f)
        {
            if (element == null) throw new ArgumentNullException(nameof(element));

            element.style.opacity = 0; // Ensure starting state
            element.style.display = DisplayStyle.Flex; // Make visible if it was hidden

            if (ShouldReduceMotion())
            {
                element.style.opacity = 1;
                if (delay > 0) await Task.Delay(TimeSpan.FromSeconds(delay * ReducedMotionDurationFactor)); // Still respect a tiny delay
                return;
            }

            await DOTween.To(() => element.style.opacity.value, x => element.style.opacity = x, 1f, duration)
                .SetDelay(delay)
                .SetEase(Ease.OutQuad)
                .AsyncWaitForCompletion();
        }

        /// <summary>
        /// Animates the opacity of the element from 1 to 0.
        /// Respects reduced motion settings. Optionally hides the element afterwards.
        /// </summary>
        /// <param name="element">The visual element to animate.</param>
        /// <param name="duration">The duration of the animation if not reduced.</param>
        /// <param name="delay">Optional delay before starting the animation.</param>
        /// <param name="hideAfterFade">If true, sets element's display to None after fading.</param>
        /// <returns>A <see cref="Task"/> representing the asynchronous animation.</returns>
        public async Task FadeOutAsync(VisualElement element, float duration, float delay = 0f, bool hideAfterFade = true)
        {
            if (element == null) throw new ArgumentNullException(nameof(element));
            
            element.style.opacity = 1; // Ensure starting state

            if (ShouldReduceMotion())
            {
                element.style.opacity = 0;
                if (hideAfterFade) element.style.display = DisplayStyle.None;
                if (delay > 0) await Task.Delay(TimeSpan.FromSeconds(delay * ReducedMotionDurationFactor));
                return;
            }
            
            await DOTween.To(() => element.style.opacity.value, x => element.style.opacity = x, 0f, duration)
                .SetDelay(delay)
                .SetEase(Ease.InQuad)
                .OnComplete(() => { if (hideAfterFade) element.style.display = DisplayStyle.None; })
                .AsyncWaitForCompletion();
        }


        /// <summary>
        /// Applies a punch/bounce scaling animation to the element.
        /// Respects reduced motion settings.
        /// </summary>
        /// <param name="element">The visual element to animate.</param>
        /// <param name="strength">The strength of the punch effect (e.g., 0.2f for a 20% punch).</param>
        /// <param name="duration">The duration of the animation if not reduced.</param>
        /// <returns>A <see cref="Task"/> representing the asynchronous animation.</returns>
        public async Task PunchScaleAsync(VisualElement element, float strength, float duration)
        {
            if (element == null) throw new ArgumentNullException(nameof(element));

            if (ShouldReduceMotion())
            {
                // For reduced motion, maybe a very quick, tiny scale or nothing.
                // Here, we'll skip it or make it near instant.
                // To make it visually "pop" slightly without much motion:
                var originalScale = element.transform.scale;
                element.transform.scale = originalScale * (1 + strength * 0.1f); // Much smaller effect
                await Task.Delay(TimeSpan.FromSeconds(InstantDuration)); // Tiny delay
                element.transform.scale = originalScale; // Reset
                return;
            }

            // UI Toolkit uses element.transform.scale (Vector3)
            // DOTween's DOPunchScale works on Transform component, not directly on VisualElement.
            // We need to tween the VisualElement's scale property.
            Vector3 initialScale = element.transform.scale;
            Vector3 punch = new Vector3(strength, strength, 0); // Assuming 2D scale punch, Z usually not used for UI Toolkit scale.

            // DOTween doesn't have a direct VisualElement.transform.scale punch.
            // We can simulate it or use a sequence.
            // Simple simulation: Tween scale up then back.
            Sequence punchSequence = DOTween.Sequence();
            punchSequence.Append(DOTween.To(() => element.transform.scale, s => element.transform.scale = s, initialScale + punch, duration * 0.5f).SetEase(Ease.OutQuad));
            punchSequence.Append(DOTween.To(() => element.transform.scale, s => element.transform.scale = s, initialScale, duration * 0.5f).SetEase(Ease.InQuad));
            
            await punchSequence.AsyncWaitForCompletion();
        }

        // Add other common animations like SlideInAsync, SlideOutAsync, ColorTweenAsync etc.
        // Example:
        // public async Task SlideInFromLeftAsync(VisualElement element, float distance, float duration)
        // {
        //     if (element == null) throw new ArgumentNullException(nameof(element));
        //     
        //     var initialX = element.transform.position.x - distance; // Assuming distance is positive
        //     element.transform.position = new Vector3(initialX, element.transform.position.y, element.transform.position.z);
        //     element.style.opacity = 0;
        //     element.style.display = DisplayStyle.Flex;
        //
        //     if (ShouldReduceMotion())
        //     {
        //         element.transform.position = new Vector3(initialX + distance, element.transform.position.y, element.transform.position.z);
        //         element.style.opacity = 1;
        //         return;
        //     }
        //
        //     Sequence seq = DOTween.Sequence();
        //     seq.Append(DOTween.To(() => element.transform.position, p => element.transform.position = p, new Vector3(initialX + distance, element.transform.position.y, element.transform.position.z), duration).SetEase(Ease.OutQuad));
        //     seq.Join(DOTween.To(() => element.style.opacity.value, o => element.style.opacity = o, 1f, duration * 0.75f)); // Fade in while sliding
        //
        //     await seq.AsyncWaitForCompletion();
        // }
    }
}