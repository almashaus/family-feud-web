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
  try {
    const audio = getAudio(key);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Browser autoplay policy blocked playback — silently ignore.
    });
  } catch {
    // Missing file or other media error — silently ignore.
  }
}

export const soundManager = {
  // Called on ANSWER_REVEALED
  playReveal: (volume?: number) => play("reveal", volume),
  // Called on STRIKE_ADDED
  playStrike: (volume?: number) => play("strike", volume),
  // Called on GAME_ENDED
  playWin: (volume?: number) => play("win", volume),

  // Preload all sounds after the first user gesture so they're ready to fire.
  preloadAll: () => {
    (Object.keys(SOUND_FILES) as SoundKey[]).forEach((key) => getAudio(key));
  },
} as const;
