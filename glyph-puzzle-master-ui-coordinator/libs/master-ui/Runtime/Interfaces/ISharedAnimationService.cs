using System.Threading.Tasks;
using UnityEngine.UIElements;

namespace GlyphPuzzle.UI.Coordinator.Interfaces
{
    /// <summary>
    /// Defines the contract for accessing shared UI animation functionalities.
    /// Provides common animations like fades, scales, and movements,
    /// respecting accessibility settings such as reduced motion.
    /// </summary>
    public interface ISharedAnimationService
    {
        /// <summary>
        /// Asynchronously fades in a visual element (animates opacity from 0 to 1).
        /// Respects reduced motion settings.
        /// </summary>
        /// <param name="element">The visual element to fade in.</param>
        /// <param name="duration">The duration of the fade animation in seconds.</param>
        /// <param name="delay">Optional delay before the animation starts in seconds.</param>
        /// <returns>A task that completes when the animation is finished.</returns>
        Task FadeInAsync(VisualElement element, float duration, float delay = 0f);

        /// <summary>
        /// Asynchronously fades out a visual element (animates opacity from 1 to 0).
        /// Respects reduced motion settings.
        /// </summary>
        /// <param name="element">The visual element to fade out.</param>
        /// <param name="duration">The duration of the fade animation in seconds.</param>
        /// <param name="delay">Optional delay before the animation starts in seconds.</param>
        /// <returns>A task that completes when the animation is finished.</returns>
        Task FadeOutAsync(VisualElement element, float duration, float delay = 0f);

        /// <summary>
        /// Asynchronously applies a punch/bounce scaling animation to a visual element.
        /// Respects reduced motion settings.
        /// </summary>
        /// <param name="element">The visual element to animate.</param>
        /// <param name="strength">The strength of the punch scale (e.g., 0.2f for 20% bigger).</param>
        /// <param name="duration">The duration of the animation in seconds.</param>
        /// <returns>A task that completes when the animation is finished.</returns>
        Task PunchScaleAsync(VisualElement element, float strength, float duration);
        
        /// <summary>
        /// Asynchronously moves a visual element from its current position to a target position.
        /// Respects reduced motion settings.
        /// </summary>
        /// <param name="element">The visual element to move.</param>
        /// <param name="targetPosition">The target position (local to its parent).</param>
        /// <param name="duration">The duration of the move animation in seconds.</param>
        /// <param name="delay">Optional delay before the animation starts in seconds.</param>
        /// <returns>A task that completes when the animation is finished.</returns>
        Task MoveToAsync(VisualElement element, UnityEngine.Vector2 targetPosition, float duration, float delay = 0f);
    }
}