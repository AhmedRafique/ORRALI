/**
 * Resolves player playback rate and TTS rate for normal and turtle-slow modes.
 */
export function resolvePlaybackRate(isSlow: boolean): { playerRate: number; ttsRate: number } {
  return {
    playerRate: isSlow ? 0.72 : 1.0,
    ttsRate: isSlow ? 0.60 : 0.88,
  };
}
