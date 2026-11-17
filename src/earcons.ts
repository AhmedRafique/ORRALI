import { createAudioPlayer, AudioPlayer } from 'expo-audio';

let earconPlayer: AudioPlayer | null = null;

export const EARCON_ASSETS = {
  success: require('../assets/audio/earcons/chime_success.wav'),
  error: require('../assets/audio/earcons/chime_error.wav'),
  fanfare: require('../assets/audio/earcons/chime_fanfare.wav'),
};

export type EarconType = keyof typeof EARCON_ASSETS;

/**
 * Plays an acoustic chime or earcon for immediate pedagogical feedback.
 * Safely catches any native audio exceptions.
 */
export async function playEarcon(type: EarconType): Promise<void> {
  try {
    if (earconPlayer) {
      try {
        earconPlayer.pause();
        earconPlayer.release();
      } catch {
        /* best effort */
      }
      earconPlayer = null;
    }
    const asset = EARCON_ASSETS[type];
    if (asset) {
      earconPlayer = createAudioPlayer(asset);
      earconPlayer.play();
    }
  } catch {
    // Graceful non-blocking fallback
  }
}
