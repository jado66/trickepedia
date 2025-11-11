// utils/sound-manager.ts

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;
  private preferenceLoaded = false;

  constructor() {
    // Avoid touching browser-only APIs during SSR.
    if (typeof window !== "undefined") {
      this.loadPreference();
    } else {
      // On the server we disable sounds to avoid any accidental attempts to play.
      this.enabled = false;
    }
  }

  /**
   * Load persisted preference from localStorage (client only)
   */
  private loadPreference() {
    if (this.preferenceLoaded) return;
    if (typeof window === "undefined") return;
    try {
      const savedPreference = window.localStorage.getItem("soundEnabled");
      this.enabled = savedPreference !== "false"; // default true unless explicitly false
    } catch (e) {
      // Swallow; localStorage might be blocked
      this.enabled = true;
    } finally {
      this.preferenceLoaded = true;
    }
  }

  /**
   * Preload a sound file
   */
  preload(key: string, path: string) {
    if (typeof window === "undefined") return;

    const audio = new Audio(path);
    audio.preload = "auto";
    this.sounds.set(key, audio);
  }

  /**
   * Play a sound
   */
  play(key: string, volume: number = 0.5) {
    if (typeof window === "undefined") return; // SSR no-op
    this.loadPreference();
    if (!this.enabled) return;

    const sound = this.sounds.get(key);
    if (sound) {
      // Clone the audio to allow overlapping plays
      const audioClone = sound.cloneNode() as HTMLAudioElement;
      audioClone.volume = Math.max(0, Math.min(1, volume));

      audioClone.play().catch((error) => {
        console.warn(`Failed to play sound "${key}":`, error);
      });
    } else {
      console.warn(`Sound "${key}" not found. Did you preload it?`);
    }
  }

  /**
   * Enable or disable sounds
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem("soundEnabled", enabled.toString());
      } catch (_) {
        // ignore write errors (private mode, quota, etc.)
      }
    }
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Initialize all notification sounds
   */
  initializeNotificationSounds() {
    this.preload("general", "/sounds/general.mp3");
    this.preload("levelup", "/sounds/levelup.mp3");
    this.preload("referral", "/sounds/referral.mp3");
  }
}

// Export singleton instance
export const soundManager = new SoundManager();
