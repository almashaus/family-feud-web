// Sound files live in public/sounds/. Each key maps to one file.
// Missing files fail silently — drop in the MP3 to activate the sound.
const SOUND_FILES = {
  reveal: "/sounds/reveal.mp3",
  strike: "/sounds/strike.mp3",
  win: "/sounds/win.mp3",
} as const;

type SoundKey = keyof typeof SOUND_FILES;

// Lazily created Audio instances, one per sound key.
const cache: Partial<Record<SoundKey, HTMLAudioElement>> = {};

// Browser autoplay policy blocks audio until the user interacts with the page.
// audioEnabled is set to true only after toggleSound() is called from a click handler.
let audioEnabled = false;
let audioMuted = false;

function getAudio(key: SoundKey): HTMLAudioElement {
  if (!cache[key]) {
    const audio = new Audio(SOUND_FILES[key]);
    audio.preload = "auto";
    cache[key] = audio;
  }
  return cache[key]!;
}

// Rewind to the start before each play so rapid back-to-back calls work.
function play(key: SoundKey, volume = 1): void {
  if (!audioEnabled || audioMuted) return;
  try {
    const audio = getAudio(key);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch {
    // Missing file or other media error — silently ignore.
  }
}

export const soundManager = {
  playReveal: (volume?: number) => play("reveal", volume),
  playStrike: (volume?: number) => play("strike", volume),
  playWin: (volume?: number) => play("win", volume),

  // Must be called from a click handler. First call primes the audio context to
  // satisfy the browser autoplay policy; subsequent calls toggle mute.
  toggleSound(): void {
    if (!audioEnabled) {
      audioEnabled = true;
      audioMuted = false;
      // Play each element at volume 0 inside this user gesture to unlock autoplay.
      (Object.keys(SOUND_FILES) as SoundKey[]).forEach((key) => {
        const audio = getAudio(key);
        audio.volume = 0;
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 1;
        }).catch(() => {});
      });
    } else {
      audioMuted = !audioMuted;
    }
  },

  isSoundOn(): boolean {
    return audioEnabled && !audioMuted;
  },

  // Starts downloading sound files early so they're ready when events fire.
  preloadAll(): void {
    (Object.keys(SOUND_FILES) as SoundKey[]).forEach((key) => getAudio(key));
  },
} as const;
