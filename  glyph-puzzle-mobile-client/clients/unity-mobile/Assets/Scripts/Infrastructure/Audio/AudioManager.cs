using UnityEngine;
using GlyphPuzzle.Mobile.Core; // For GameConstants for PlayerPrefs keys

namespace GlyphPuzzle.Mobile.Infrastructure.Audio
{
    /// <summary>
    /// Manages audio playback for music and sound effects.
    /// Handles playing, stopping, fading, and volume control.
    /// Persists volume settings.
    /// Implements REQ-AS-003, REQ-CGLE-016 (for SFX).
    /// </summary>
    [RequireComponent(typeof(AudioSource), typeof(AudioSource))] // For music and SFX sources
    public class AudioManager : MonoBehaviour
    {
        private static AudioManager _instance;
        public static AudioManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<AudioManager>();
                    if (_instance == null)
                    {
                        GameObject singletonObject = new GameObject("AudioManager");
                        _instance = singletonObject.AddComponent<AudioManager>();
                    }
                }
                return _instance;
            }
        }

        [Header("Audio Sources")]
        [Tooltip("AudioSource for background music.")]
        [SerializeField] private AudioSource musicSource;

        [Tooltip("AudioSource for sound effects.")]
        [SerializeField] private AudioSource sfxSource;
        
        // Default volume levels
        private const float DefaultMusicVolume = 0.7f;
        private const float DefaultSfxVolume = 0.9f;

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeAudioSources();
            LoadVolumeSettings();
        }

        private void InitializeAudioSources()
        {
            AudioSource[] sources = GetComponents<AudioSource>();
            if (musicSource == null)
            {
                musicSource = sources.Length > 0 ? sources[0] : gameObject.AddComponent<AudioSource>();
                musicSource.loop = true;
                musicSource.playOnAwake = false;
            }
            if (sfxSource == null)
            {
                sfxSource = sources.Length > 1 ? sources[1] : gameObject.AddComponent<AudioSource>();
                sfxSource.loop = false;
                sfxSource.playOnAwake = false;
            }
        }
        
        private void LoadVolumeSettings()
        {
            float musicVol = PlayerPrefs.GetFloat(GameConstants.PlayerPrefsMusicVolumeKey, DefaultMusicVolume);
            float sfxVol = PlayerPrefs.GetFloat(GameConstants.PlayerPrefsSfxVolumeKey, DefaultSfxVolume);
            SetMusicVolume(musicVol);
            SetSfxVolume(sfxVol);
        }

        private void SaveVolumeSettings()
        {
            PlayerPrefs.SetFloat(GameConstants.PlayerPrefsMusicVolumeKey, musicSource.volume);
            PlayerPrefs.SetFloat(GameConstants.PlayerPrefsSfxVolumeKey, sfxSource.volume);
            PlayerPrefs.Save();
        }


        /// <summary>
        /// Plays the given audio clip as background music.
        /// If music is already playing, it will be stopped and replaced.
        /// </summary>
        /// <param name="clip">The music clip to play.</param>
        public void PlayMusic(AudioClip clip)
        {
            if (musicSource == null || clip == null)
            {
                Debug.LogWarning("AudioManager: Music source or clip is null.");
                return;
            }

            if (musicSource.isPlaying && musicSource.clip == clip) return; // Already playing this clip

            musicSource.Stop();
            musicSource.clip = clip;
            musicSource.Play();
        }

        public void StopMusic()
        {
            if (musicSource != null) musicSource.Stop();
        }

        /// <summary>
        /// Plays the given audio clip as a sound effect.
        /// Uses PlayOneShot for overlapping sounds.
        /// </summary>
        /// <param name="clip">The sound effect clip to play.</param>
        /// <param name="volumeScale">Optional volume scale for this specific SFX.</param>
        public void PlaySfx(AudioClip clip, float volumeScale = 1.0f)
        {
            if (sfxSource == null || clip == null)
            {
                Debug.LogWarning("AudioManager: SFX source or clip is null.");
                return;
            }
            sfxSource.PlayOneShot(clip, volumeScale);
        }

        /// <summary>
        /// Sets the volume for background music.
        /// </summary>
        /// <param name="volume">Volume level (0.0 to 1.0).</param>
        public void SetMusicVolume(float volume)
        {
            if (musicSource == null) return;
            musicSource.volume = Mathf.Clamp01(volume);
            SaveVolumeSettings();
        }

        /// <summary>
        /// Sets the volume for sound effects.
        /// </summary>
        /// <param name="volume">Volume level (0.0 to 1.0).</param>
        public void SetSfxVolume(float volume)
        {
            if (sfxSource == null) return;
            sfxSource.volume = Mathf.Clamp01(volume); // Note: PlayOneShot's scale is multiplicative with this.
            SaveVolumeSettings();
        }
        
        public float GetMusicVolume() => musicSource != null ? musicSource.volume : 0f;
        public float GetSfxVolume() => sfxSource != null ? sfxSource.volume : 0f;
    }
}