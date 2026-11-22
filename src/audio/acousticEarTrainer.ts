import { LangCode } from '../types';

export type SpeechRateTier =
  | 'learner'
  | 'standard'
  | 'fast_street'
  | 'blazing_native';

export const SPEECH_RATES: Record<SpeechRateTier, number> = {
  learner: 0.75,
  standard: 1.0,
  fast_street: 1.25,
  blazing_native: 1.5,
};

export type AmbientNoiseProfile =
  | 'quiet_studio'
  | 'cafe_clatter'
  | 'subway_rumble'
  | 'street_rain';

export interface PhoneticLiaison {
  wordIndex: number;
  word1: string;
  word2: string;
  kind: 'liaison_fr' | 'glottal_de' | 'sinalefa_es';
  explanation: string;
}

export interface AcousticListeningChallenge {
  id: string;
  targetPhrase: string;
  en: string;
  languageId: LangCode;
  speedTier: SpeechRateTier;
  playbackRate: number;
  ambientProfile: AmbientNoiseProfile;
  liaisons: PhoneticLiaison[];
  maskedTarget: string;
  missingWord: string;
  distractors: string[];
}

/**
 * Detects language-specific acoustic mergers, liaisons, and glottal breaks.
 */
export function detectPhoneticLiaisons(
  phrase: string,
  lang: LangCode
): PhoneticLiaison[] {
  const words = phrase
    .replace(/[.,!?;:¿¡"']/g, '')
    .trim()
    .split(/\s+/);
  const results: PhoneticLiaison[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    const w1 = words[i].toLowerCase();
    const w2 = words[i + 1].toLowerCase();

    if (lang === 'fr') {
      // French liaison: word ending in s/x/z/t/d/n followed by vowel or mute h
      const endsInConsonant = /[sxztdn]$/.test(w1);
      const startsWithVowel = /^[aeiouyh]/i.test(w2);
      if (endsInConsonant && startsWithVowel) {
        results.push({
          wordIndex: i,
          word1: words[i],
          word2: words[i + 1],
          kind: 'liaison_fr',
          explanation: `Liaison: "${words[i]}" links to "${words[i + 1]}", blending into [${w1.slice(-1) === 's' ? 'z' : 't'}] sound.`,
        });
      }
    } else if (lang === 'de') {
      // German glottal stop: vowel-initial second word requires glottal vocal cord closure
      const startsWithVowel = /^[aeiouäöü]/i.test(w2);
      if (startsWithVowel) {
        results.push({
          wordIndex: i,
          word1: words[i],
          word2: words[i + 1],
          kind: 'glottal_de',
          explanation: `Knacklaut (Glottal Stop): Vocal cords briefly pause before enunciating "${words[i + 1]}".`,
        });
      }
    } else if (lang === 'es') {
      // Spanish sinalefa: word ending in vowel merges seamlessly with starting vowel
      const endsInVowel = /[aeiouáéíóú]$/i.test(w1);
      const startsWithVowel = /^[aeiouáéíóúh]/i.test(w2);
      if (endsInVowel && startsWithVowel) {
        results.push({
          wordIndex: i,
          word1: words[i],
          word2: words[i + 1],
          kind: 'sinalefa_es',
          explanation: `Sinalefa: Vowels in "${words[i]}" and "${words[i + 1]}" merge into a single continuous acoustic syllable.`,
        });
      }
    }
  }

  return results;
}

/**
 * Builds an acoustic ear-training challenge with masked rapid word comprehension.
 */
export function generateEarTrainingChallenge(
  phrase: string,
  en: string,
  lang: LangCode,
  speedTier: SpeechRateTier = 'fast_street',
  ambientProfile: AmbientNoiseProfile = 'cafe_clatter'
): AcousticListeningChallenge {
  const words = phrase.split(/\s+/);
  const cleanWords = words.map((w) => w.replace(/[.,!?;:¿¡"']/g, ''));

  // Select a word of at least 4 letters to mask, or middle word
  let targetIdx = Math.floor(words.length / 2);
  for (let i = 0; i < cleanWords.length; i++) {
    if (cleanWords[i].length >= 4) {
      targetIdx = i;
      break;
    }
  }

  const missingWord = cleanWords[targetIdx];
  const maskedWords = [...words];
  maskedWords[targetIdx] = '____';

  const liaisons = detectPhoneticLiaisons(phrase, lang);

  // Generate believable phonetic distractors
  const distractors = [
    missingWord,
    missingWord.length > 2 ? `${missingWord}s` : `${missingWord}e`,
    cleanWords[(targetIdx + 1) % cleanWords.length] || 'aussi',
    cleanWords[(targetIdx + 2) % cleanWords.length] || 'toujours',
  ].filter((v, i, a) => a.indexOf(v) === i);

  // Shuffle distractors
  const shuffledOptions = distractors.sort(() => Math.random() - 0.5);

  return {
    id: `ear_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    targetPhrase: phrase,
    en,
    languageId: lang,
    speedTier,
    playbackRate: SPEECH_RATES[speedTier],
    ambientProfile,
    liaisons,
    maskedTarget: maskedWords.join(' '),
    missingWord,
    distractors: shuffledOptions,
  };
}

/**
 * Evaluates listener's comprehension of the fast acoustic phrase.
 */
export function evaluateEarTrainingAnswer(
  challenge: AcousticListeningChallenge,
  selectedWord: string
): { isCorrect: boolean; feedback: string; earnedXp: number } {
  const isMatch =
    selectedWord.trim().toLowerCase() ===
    challenge.missingWord.trim().toLowerCase();

  if (isMatch) {
    return {
      isCorrect: true,
      feedback: `Outstanding ear! You accurately decoded "${challenge.missingWord}" at ${challenge.playbackRate}x speed in ${challenge.ambientProfile.replace(/_/g, ' ')}.`,
      earnedXp: challenge.playbackRate >= 1.25 ? 30 : 20,
    };
  }

  return {
    isCorrect: false,
    feedback: `The correct word was "${challenge.missingWord}". Pay attention to phonetic liaisons and word boundaries at high speed.`,
    earnedXp: 5,
  };
}
