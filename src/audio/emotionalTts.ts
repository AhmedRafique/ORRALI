import { LangCode } from '../types';

export type EmotionalInflection =
  | 'neutral'
  | 'warm_greeting'
  | 'surprised_curveball'
  | 'encouraging_correction'
  | 'authoritative'
  | 'celebratory';

export interface PersonaVoiceProfile {
  characterId: string;
  languageId: LangCode;
  baseSpeechLang: string;
  baseRate: number;
  basePitch: number;
  timbreDescription: string;
}

export const PERSONA_VOICE_PROFILES: Record<string, PersonaVoiceProfile> = {
  // French Personas
  pierre: {
    characterId: 'pierre',
    languageId: 'fr',
    baseSpeechLang: 'fr-FR',
    baseRate: 0.95,
    basePitch: 1.0,
    timbreDescription: 'Warm, hospitable Parisian bistro host',
  },
  claire: {
    characterId: 'claire',
    languageId: 'fr',
    baseSpeechLang: 'fr-FR',
    baseRate: 1.0,
    basePitch: 1.05,
    timbreDescription: 'Crisp, articulate station conductor',
  },
  antoine: {
    characterId: 'antoine',
    languageId: 'fr',
    baseSpeechLang: 'fr-FR',
    baseRate: 0.92,
    basePitch: 0.95,
    timbreDescription: 'Measured, diplomatic executive',
  },

  // German Personas
  julia: {
    characterId: 'julia',
    languageId: 'de',
    baseSpeechLang: 'de-DE',
    baseRate: 0.95,
    basePitch: 1.05,
    timbreDescription: 'Enthusiastic Bavarian cultural guide',
  },
  hans: {
    characterId: 'hans',
    languageId: 'de',
    baseSpeechLang: 'de-DE',
    baseRate: 0.92,
    basePitch: 0.92,
    timbreDescription: 'Authoritative, calm high-speed train conductor',
  },
  frau_schmidt: {
    characterId: 'frau_schmidt',
    languageId: 'de',
    baseSpeechLang: 'de-DE',
    baseRate: 0.9,
    basePitch: 1.0,
    timbreDescription: 'Distinguished, formal Hamburg manager',
  },

  // Spanish Personas
  mateo: {
    characterId: 'mateo',
    languageId: 'es',
    baseSpeechLang: 'es-ES',
    baseRate: 1.0,
    basePitch: 1.05,
    timbreDescription: 'Vivacious, rhythmic Madrid market artisan',
  },
  lucia: {
    characterId: 'lucia',
    languageId: 'es',
    baseSpeechLang: 'es-ES',
    baseRate: 0.95,
    basePitch: 1.0,
    timbreDescription: 'Gracious, gentle boutique concierge',
  },
  carlos: {
    characterId: 'carlos',
    languageId: 'es',
    baseSpeechLang: 'es-ES',
    baseRate: 0.98,
    basePitch: 0.98,
    timbreDescription: 'Sharp, modern bilingual tech advisor',
  },
};

export interface EmotionalSpeechOptions {
  characterId?: string;
  languageId?: LangCode;
  inflection?: EmotionalInflection;
  overrideRate?: number;
  overridePitch?: number;
  onDone?: () => void;
  onError?: (err: Error) => void;
}

export interface ResolvedSpeechParameters {
  language: string;
  rate: number;
  pitch: number;
  inflection: EmotionalInflection;
  timbreDescription: string;
}

export type SpeechInvoker = {
  speak: (text: string, options?: any) => void;
  stop: () => void;
};

let customSpeechInvoker: SpeechInvoker | null = null;

function getSpeech(): SpeechInvoker | null {
  if (customSpeechInvoker) return customSpeechInvoker;
  try {
    return require('expo-speech');
  } catch {
    return null;
  }
}

export function setSpeechInvoker(invoker: SpeechInvoker | null): void {
  customSpeechInvoker = invoker;
}

/**
 * Resolves acoustic prosody parameters (pitch, speed, tone) for a given character and emotional mood.
 */
export function resolveEmotionalSpeechParams(
  options: EmotionalSpeechOptions = {}
): ResolvedSpeechParameters {
  const {
    characterId,
    languageId = 'fr',
    inflection = 'neutral',
    overrideRate,
    overridePitch,
  } = options;

  const profile =
    (characterId ? PERSONA_VOICE_PROFILES[characterId.toLowerCase()] : null) ?? {
      characterId: 'default',
      languageId,
      baseSpeechLang:
        languageId === 'de' ? 'de-DE' : languageId === 'es' ? 'es-ES' : 'fr-FR',
      baseRate: 0.95,
      basePitch: 1.0,
      timbreDescription: 'Standard native conversational assistant',
    };

  // Inflection modifier multipliers
  let rateMod = 1.0;
  let pitchMod = 1.0;

  switch (inflection) {
    case 'warm_greeting':
      rateMod = 0.96;
      pitchMod = 1.02;
      break;
    case 'surprised_curveball':
      // Higher pitch, slightly rushed cadence
      rateMod = 1.06;
      pitchMod = 1.15;
      break;
    case 'encouraging_correction':
      // Slower, clearer, supportive pitch
      rateMod = 0.88;
      pitchMod = 0.98;
      break;
    case 'authoritative':
      // Lower pitch, steady rhythm
      rateMod = 0.92;
      pitchMod = 0.92;
      break;
    case 'celebratory':
      // Uplifting pitch and animated cadence
      rateMod = 1.04;
      pitchMod = 1.18;
      break;
    case 'neutral':
    default:
      rateMod = 1.0;
      pitchMod = 1.0;
      break;
  }

  const finalRate = Math.round(
    Math.max(0.5, Math.min(2.0, (overrideRate ?? profile.baseRate) * rateMod)) * 100
  ) / 100;

  const finalPitch = Math.round(
    Math.max(0.5, Math.min(2.0, (overridePitch ?? profile.basePitch) * pitchMod)) * 100
  ) / 100;

  return {
    language: profile.baseSpeechLang,
    rate: finalRate,
    pitch: finalPitch,
    inflection,
    timbreDescription: profile.timbreDescription,
  };
}

/**
 * Synthesizes speech with emotional prosody.
 * Uses local device TTS with dynamic pitch/rate shaping as bulletproof offline-first engine.
 */
export async function playEmotionalSpeech(
  text: string,
  options: EmotionalSpeechOptions = {}
): Promise<ResolvedSpeechParameters> {
  const params = resolveEmotionalSpeechParams(options);
  const speech = getSpeech();

  try {
    speech?.stop();
    speech?.speak(text, {
      language: params.language,
      rate: params.rate,
      pitch: params.pitch,
      onDone: options.onDone,
      onError: (err: any) => {
        options.onError?.(new Error(String(err)));
      },
    });
  } catch (err) {
    console.warn('[ORRALI EmotionalTTS] Playback error:', err);
    options.onError?.(err as Error);
  }

  return params;
}

/**
 * Immediately stops any active emotional speech synthesis.
 */
export function stopEmotionalSpeech(): void {
  try {
    getSpeech()?.stop();
  } catch {}
}
