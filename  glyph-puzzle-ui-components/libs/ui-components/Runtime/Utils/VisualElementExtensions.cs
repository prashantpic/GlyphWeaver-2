using UnityEngine;
using UnityEngine.UIElements;
using DG.Tweening; // DOTween namespace

namespace GlyphPuzzle.UI.Utils
{
    public static class VisualElementExtensions
    {
        /// <summary>
        /// Fades the VisualElement in by animating its opacity from its current value (or 0 if not set) to 1.
        /// </summary>
        /// <param name="element">The visual element to fade.</param>
        /// <param name="duration">The duration of the fade animation in seconds.</param>
        /// <returns>A DOTween tweener controlling the animation.</returns>
        public static DG.Tweening.Core.TweenerCore<float, float, DG.Tweening.Plugins.Options.FloatOptions> FadeIn(this VisualElement element, float duration)
        {
            if (element == null) return null;
            // Ensure starting from a fully transparent state if it's meant to be an "appear" fade-in
            // If opacity is already partially set, it will animate from current.
            // For a strict "appear" fade-in, you might want: element.style.opacity = 0f;
            return DOTween.To(() => element.style.opacity.value, x => element.style.opacity = x, 1f, duration)
                          .SetTarget(element);
        }

        /// <summary>
        /// Fades the VisualElement out by animating its opacity from its current value to 0.
        /// </summary>
        /// <param name="element">The visual element to fade.</param>
        /// <param name="duration">The duration of the fade animation in seconds.</param>
        /// <returns>A DOTween tweener controlling the animation.</returns>
        public static DG.Tweening.Core.TweenerCore<float, float, DG.Tweening.Plugins.Options.FloatOptions> FadeOut(this VisualElement element, float duration)
        {
            if (element == null) return null;
            return DOTween.To(() => element.style.opacity.value, x => element.style.opacity = x, 0f, duration)
                          .SetTarget(element);
        }

        /// <summary>
        /// Moves the VisualElement to a target position by animating its transform.position.
        /// Note: This animates the layout position. For style-based position (left, top), use a different approach.
        /// </summary>
        /// <param name="element">The visual element to move.</param>
        /// <param name="targetPosition">The target position (X, Y). Z will be maintained.</param>
        /// <param name="duration">The duration of the move animation in seconds.</param>
        /// <returns>A DOTween tweener controlling the animation.</returns>
        public static DG.Tweening.Core.TweenerCore<Vector3, Vector3, DG.Tweening.Plugins.Options.VectorOptions> MoveTo(this VisualElement element, Vector2 targetPosition, float duration)
        {
            if (element == null) return null;
            Vector3 currentPos = element.transform.position;
            Vector3 newTargetPosition = new Vector3(targetPosition.x, targetPosition.y, currentPos.z);
            
            return DOTween.To(() => element.transform.position, x => element.transform.position = x, newTargetPosition, duration)
                          .SetTarget(element);
        }

        // Example of moving using style.translate for relative movement (doesn't affect layout of other elements)
        // public static DG.Tweening.Core.TweenerCore<Vector3, Vector3, DG.Tweening.Plugins.Options.VectorOptions> TranslateTo(this VisualElement element, Vector2 translateOffset, float duration)
        // {
        //     if (element == null) return null;
        //     Vector3 targetTranslate = new Vector3(translateOffset.x, translateOffset.y, 0); // Assuming Z translate is not used for 2D UI
        //     return DOTween.To(() => element.style.translate.value.ToVector3(), 
        //                       x => element.style.translate = new Translate(new Length(x.x, LengthUnit.Pixel), new Length(x.y, LengthUnit.Pixel), x.z), 
        //                       targetTranslate, 
        //                       duration)
        //                   .SetTarget(element);
        // }
    }

    // Helper extension for StyleTranslate to Vector3 conversion if needed for DOTween
    // internal static class StyleValueExtensions
    // {
    //     public static Vector3 ToVector3(this StyleTranslate st)
    //     {
    //         return new Vector3(
    //             st.x.unit == LengthUnit.Pixel ? st.x.value : 0, 
    //             st.y.unit == LengthUnit.Pixel ? st.y.value : 0,
    //             st.z.unit == LengthUnit.Pixel ? st.z.value : 0 // UI Toolkit z is typically for perspective transforms
    //         );
    //     }
    // }
}