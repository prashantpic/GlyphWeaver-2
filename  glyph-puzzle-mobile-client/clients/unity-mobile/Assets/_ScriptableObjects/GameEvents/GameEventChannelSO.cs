using UnityEngine;
using System;

namespace GlyphPuzzle.Mobile.Core.Events
{
    /// <summary>
    /// A ScriptableObject that acts as an event channel.
    /// Allows game systems to subscribe to or raise events without direct dependencies.
    /// Implements ObserverPattern, EventChannel.
    /// Purpose: To provide a global, decoupled eventing mechanism using ScriptableObjects.
    /// </summary>
    [CreateAssetMenu(fileName = "GameEventChannel", menuName = "GlyphPuzzle/Events/Game Event Channel")]
    public class GameEventChannelSO : ScriptableObject
    {
        /// <summary>
        /// Event raised when RaiseEvent is called. Systems can subscribe to this action.
        /// </summary>
        public event Action OnEventRaised;

        /// <summary>
        /// Raises the event, invoking all subscribed listeners.
        /// </summary>
        public void RaiseEvent()
        {
            OnEventRaised?.Invoke();
        }
    }
}