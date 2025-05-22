using UnityEngine;

namespace GlyphWeaver.Client.Core.Patterns
{
    /// <summary>
    /// A generic base class for creating MonoBehaviour components that follow the Singleton pattern.
    /// Ensures only one instance of the component exists and provides a static accessor.
    /// </summary>
    /// <typeparam name="T">The type of the Singleton component.</typeparam>
    public abstract class Singleton<T> : MonoBehaviour where T : MonoBehaviour
    {
        private static T _instance;
        private static readonly object _lock = new object();
        private static bool _applicationIsQuitting = false;

        /// <summary>
        /// Gets the static instance of the Singleton.
        /// If an instance does not exist, it attempts to find or create one.
        /// </summary>
        public static T Instance
        {
            get
            {
                if (_applicationIsQuitting)
                {
                    Debug.LogWarning($"[Singleton] Instance '{typeof(T)}' already destroyed on application quit. Won't create again - returning null.");
                    return null;
                }

                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = (T)FindObjectOfType(typeof(T));

                        if (FindObjectsOfType(typeof(T)).Length > 1)
                        {
                            Debug.LogError("[Singleton] Something went really wrong - there should never be more than 1 singleton! Reopening the scene might fix it.");
                            return _instance;
                        }

                        if (_instance == null)
                        {
                            GameObject singletonObject = new GameObject();
                            _instance = singletonObject.AddComponent<T>();
                            singletonObject.name = $"(Singleton) {typeof(T).ToString()}";

                            // Optionally, make it persistent across scenes
                            // DontDestroyOnLoad(singletonObject); 
                            
                            Debug.Log($"[Singleton] An instance of {typeof(T)} is needed in the scene, so '{singletonObject.name}' was created.");
                        }
                        else
                        {
                            Debug.Log($"[Singleton] Using instance already created: {_instance.gameObject.name}");
                        }
                    }
                    return _instance;
                }
            }
        }

        /// <summary>
        /// Called when the script instance is being loaded.
        /// Used here to ensure the Singleton instance is correctly set up
        /// and to handle persistence if DontDestroyOnLoad is used.
        /// </summary>
        protected virtual void Awake()
        {
            if (_instance == null)
            {
                _instance = this as T;
                // Optionally, make it persistent across scenes
                // DontDestroyOnLoad(gameObject); 
            }
            else if (_instance != this)
            {
                Debug.LogWarning($"[Singleton] Instance of {typeof(T)} already exists. Destroying duplicate '{gameObject.name}'.");
                Destroy(gameObject);
            }
        }

        /// <summary>
        /// Called when the application quits.
        /// Sets a flag to prevent recreation of the Singleton instance during shutdown.
        /// </summary>
        protected virtual void OnApplicationQuit()
        {
            _applicationIsQuitting = true;
        }
        
        /// <summary>
        /// Called when the GameObject will be destroyed.
        /// Nullifies the instance if this is the singleton instance being destroyed.
        /// </summary>
        protected virtual void OnDestroy()
        {
            if (_instance == this)
            {
                _applicationIsQuitting = true; // To be safe, also set here
                //_instance = null; // Commented out as OnApplicationQuit handles the flag
            }
        }
    }
}