using UnityEngine;

namespace GlyphWeaver.Client.Core.Patterns
{
    /// <summary>
    /// A generic base class for creating MonoBehaviour Singletons.
    /// Ensures that only one instance of the Singleton exists.
    /// </summary>
    /// <typeparam name="T">The type of the Singleton component.</typeparam>
    public abstract class Singleton<T> : MonoBehaviour where T : MonoBehaviour
    {
        private static T _instance;
        private static readonly object _lock = new object();
        private static bool _applicationIsQuitting = false;

        /// <summary>
        /// Gets the single instance of this Singleton.
        /// If an instance does not exist, it tries to find one or creates a new one.
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
                            singletonObject.name = $"(Singleton) {typeof(T)}";

                            // Make instance persistent across scene loads, if desired for this singleton type.
                            // Subclasses can override `IsPersistent()` to control this.
                            if (Instance is Singleton<T> s && s.IsPersistent())
                            {
                                DontDestroyOnLoad(singletonObject);
                            }
                            
                            Debug.Log($"[Singleton] An instance of {typeof(T)} is needed in the scene, so '{singletonObject}' was created with DontDestroyOnLoad.");
                        }
                        else
                        {
                            Debug.Log($"[Singleton] Using instance already created: {_instance.gameObject.name}");
                             if (Instance is Singleton<T> s && s.IsPersistent())
                            {
                                DontDestroyOnLoad(_instance.gameObject);
                            }
                        }
                    }
                    return _instance;
                }
            }
        }

        /// <summary>
        /// Called when the script instance is being loaded.
        /// Ensures the Singleton pattern is enforced.
        /// </summary>
        protected virtual void Awake()
        {
            if (_instance == null)
            {
                _instance = this as T;
                if (IsPersistent())
                {
                    DontDestroyOnLoad(gameObject);
                }
            }
            else if (_instance != this)
            {
                Debug.LogWarning($"[Singleton] Instance of {typeof(T)} already exists. Destroying duplicate: {gameObject.name}");
                Destroy(gameObject);
                return;
            }
            
            // Call a custom initialization method for subclasses
            InitializeSingleton();
        }

        /// <summary>
        /// Called when the application is quitting.
        /// Prevents creation of buggy ghost objects.
        /// </summary>
        protected virtual void OnApplicationQuit()
        {
            _applicationIsQuitting = true;
        }

        protected virtual void OnDestroy()
        {
            if (_instance == this)
            {
               // _applicationIsQuitting = true; // More robust to set this on OnApplicationQuit globally
            }
        }
        
        /// <summary>
        /// Override this method in subclasses to provide custom initialization logic
        /// that should run once when the singleton is first accessed or initialized.
        /// </summary>
        protected virtual void InitializeSingleton()
        {
            // Base implementation does nothing.
        }

        /// <summary>
        /// Override this method in subclasses to indicate if the singleton should persist across scene loads.
        /// Defaults to true.
        /// </summary>
        /// <returns>True if the singleton should persist; false otherwise.</returns>
        protected virtual bool IsPersistent()
        {
            return true;
        }
    }
}