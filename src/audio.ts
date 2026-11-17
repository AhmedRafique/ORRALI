import * as Speech from 'expo-speech';
import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { AUDIO_ASSETS } from './audioMap';
import { Item } from './types';

import { resolvePlaybackRate } from './audioSpeed';

export * from './audioSpeed';

let currentPlayer: AudioPlayer | null = null;

/**
 * Stop any active audio playback (both audio player and TTS).
 */
export async function stopAllAudio(): Promise<void> {
  try {
    if (currentPlayer) {
      currentPlayer.pause();
      currentPlayer = null;
    }
  } catch {
    /* best effort */
  }
  try {
    void Speech.stop();
  } catch {
    /* best effort */
  }
}

/**
 * Discovers and ranks the highest-quality voice for a given language code.
 * Prioritizes Enhanced / Neural / WaveNet voices over robotic local engines.
 */
export async function findBestVoiceForLanguage(langCode: string): Promise<string | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const lang = langCode.toLowerCase();

    // Filter to voices matching the target language
    const langVoices = voices.filter((v) => {
      const vLang = (v.language ?? '').toLowerCase();
      const vId = (v.identifier ?? '').toLowerCase();
      return vLang.startsWith(lang) || vId.startsWith(lang) || vId.includes(`-${lang}-`) || vId.includes(`_${lang}_`);
    });

    if (langVoices.length === 0) return undefined;

    // Rank 1: Explicitly marked Enhanced quality or neural/wavenet/network
    const neuralVoice = langVoices.find((v) => {
      const vId = (v.identifier ?? '').toLowerCase();
      const isEnhanced = (v.quality as string) === 'Enhanced' || v.quality === Speech.VoiceQuality.Enhanced;
      const isNeural = vId.includes('network') || vId.includes('neural') || vId.includes('wavenet') || vId.includes('premium');
      return isEnhanced || isNeural;
    });

    if (neuralVoice) return neuralVoice.identifier;

    // Rank 2: First available matching language voice
    return langVoices[0].identifier;
  } catch {
    return undefined;
  }
}

/**
 * Play an item's phrase:
 * 1. Uses pre-rendered high-fidelity human studio audio if available in bundle.
 *    Supports pitch-preserved slow turtle playback (0.72x) or normal speed (1.0x).
 * 2. Falls back to high-definition neural TTS speech synthesis.
 */
export async function playPhraseAudio(
  item: Item,
  langCode: string,
  preferredVoiceId?: string,
  isSlow = false
): Promise<void> {
  await stopAllAudio();

  const { playerRate, ttsRate } = resolvePlaybackRate(isSlow);

  // 1. Play pre-rendered studio human audio from bundled assets
  const audioSource = item.audio ?? AUDIO_ASSETS[item.id];
  if (audioSource) {
    try {
      const player = createAudioPlayer(audioSource);
      currentPlayer = player;
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(playerRate);
      player.play();
      return;
    } catch (err) {
      console.warn('[ORRALI Audio] Studio audio failed, falling back to TTS:', err);
    }
  }

  // 2. Play using enhanced speech synthesizer fallback
  Speech.speak(item.target, {
    language: langCode,
    voice: preferredVoiceId,
    rate: ttsRate,
    pitch: 1.0,
  });
}
