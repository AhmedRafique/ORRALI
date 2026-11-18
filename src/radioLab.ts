import { norm, shuffle } from './exercises';
import { Course, Item, LangCode } from './types';

export interface DictationChallenge {
  item: Item;
  targetPhrase: string;
  tokens: string[];
  blankIndices: number[];
  targetWords: string[];
  wordBank: string[];
  connectedSpeechTip: string;
}

function cleanWord(w: string): string {
  return w.replace(/^[.,!?¿¡;:"']+|[.,!?¿¡;:"']+$/g, '').trim();
}

/**
 * Returns phonetic insights on liaisons, contractions, and vowel merges for connected speech.
 */
export function getConnectedSpeechInsight(phrase: string, lang: LangCode): string {
  const lower = phrase.toLowerCase();

  if (lang === 'fr') {
    if (
      lower.includes('vous avez') ||
      lower.includes('ils ont') ||
      lower.includes('les amis') ||
      lower.includes('c’est un') ||
      lower.includes("c'est un") ||
      lower.includes('tout à fait')
    ) {
      return 'Connected Liaison: In French, the normally silent final consonant (such as "s" sounding as /z/ or "t" sounding as /t/) bridges into the following vowel sound.';
    }
    return 'Liaison & Rhythm: French words flow as continuous sound groups without harsh pauses between words.';
  }

  if (lang === 'de') {
    if (
      lower.includes(' am ') ||
      lower.includes(' im ') ||
      lower.includes(' zum ') ||
      lower.includes(' zur ') ||
      lower.includes(' ans ') ||
      lower.includes(' beim ') ||
      lower.includes(' vom ')
    ) {
      return 'Contraction Alert: Spoken German constantly contracts prepositions with definite articles (e.g., an + dem = am, in + dem = im, zu + der = zur).';
    }
    return 'Glottal Articulation: German clearly separates words with vowels using the Knacklaut (glottal stop) for crisp pronunciation.';
  }

  if (lang === 'es') {
    if (
      lower.includes('de acuerdo') ||
      lower.includes('va a') ||
      lower.includes('me alegro') ||
      lower.includes('no entiendo') ||
      lower.includes('que es')
    ) {
      return 'Sinalefa Blend: In spoken Spanish, adjacent vowels across word boundaries merge into a single musical syllable without a pause.';
    }
    return 'Sinalefa Harmony: Notice how vowels across neighboring words connect smoothly like a single continuous word.';
  }

  return 'Natural Cadence: Listen closely to the acoustic rhythm and stress patterns of the phrase.';
}

/**
 * Generates an interactive cloze dictation challenge with masked blanks and distractor chips.
 */
export function generateDictationChallenge(
  item: Item,
  course: Course,
  numBlanks = 2
): DictationChallenge {
  const tokens = item.target.trim().split(/\s+/);
  const eligibleIndices: number[] = [];

  tokens.forEach((t, i) => {
    const cleaned = cleanWord(t);
    if (cleaned.length >= 2) {
      eligibleIndices.push(i);
    }
  });

  // Pick up to numBlanks
  const desiredCount = Math.min(numBlanks, Math.max(1, eligibleIndices.length));
  const shuffledIndices = shuffle(eligibleIndices).slice(0, desiredCount).sort((a, b) => a - b);

  const targetWords = shuffledIndices.map((idx) => cleanWord(tokens[idx]));

  // Distractor pool from other lesson items
  const allWords = course.lessons
    .flatMap((l) => l.items)
    .filter((i) => i.id !== item.id)
    .flatMap((i) => i.target.split(/\s+/))
    .map(cleanWord)
    .filter((w) => w.length >= 2 && !targetWords.includes(w));

  const uniqueDistractors = Array.from(new Set(allWords)).slice(0, Math.max(3, targetWords.length * 2));
  const wordBank = shuffle([...targetWords, ...uniqueDistractors]);

  return {
    item,
    targetPhrase: item.target,
    tokens,
    blankIndices: shuffledIndices,
    targetWords,
    wordBank,
    connectedSpeechTip: getConnectedSpeechInsight(item.target, course.code),
  };
}

/**
 * Validates learner's assembled or typed answers for the dictation blanks.
 */
export function evaluateDictationAnswer(
  challenge: DictationChallenge,
  userWords: string[]
): boolean {
  if (userWords.length !== challenge.targetWords.length) {
    return false;
  }

  return challenge.targetWords.every((expected, idx) => {
    const user = userWords[idx] ?? '';
    return norm(expected) === norm(user);
  });
}

/**
 * Generates a 5-challenge broadcast round across course lessons.
 */
export function buildRadioLabRound(
  course: Course,
  count = 5
): DictationChallenge[] {
  const allItems = course.lessons.flatMap((l) => l.items);
  const selectedItems = shuffle(allItems).slice(0, Math.min(count, allItems.length));
  return selectedItems.map((item) => generateDictationChallenge(item, course, 2));
}
