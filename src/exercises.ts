import { Course, Exercise, Item, AnswerEvaluation } from './types';

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Normalise for answer checking: case, punctuation and spacing ignored. */
export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?¿¡;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Strip accents for accent-forgiving comparison (e.g. 'plaît' -> 'plait', 'café' -> 'cafe'). */
export const stripAccents = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Calculate Levenshtein distance between two normalized strings. */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Intelligent pedagogical answer evaluation:
 * 1. Checks exact match against primary target.
 * 2. Checks exact match against any accepted alternative (informal/formal, synonyms).
 * 3. Checks accent-forgiving match (e.g. 'plait' for 'plaît').
 * 4. Checks near-miss typos (e.g. 'S'il tu plait' for 'S'il te plaît').
 */
export function evaluateAnswer(given: string, item: Item): AnswerEvaluation {
  const normGiven = norm(given);
  const variants = [item.target, ...(item.alternatives ?? [])];

  // 1. Exact match with target
  if (normGiven === norm(item.target)) {
    return { ok: true, expected: item.target };
  }

  // 2. Exact match with any accepted alternative
  for (const alt of item.alternatives ?? []) {
    if (normGiven === norm(alt)) {
      return {
        ok: true,
        expected: item.target,
        matchedVariant: alt,
        hint: `Also accepted: "${alt}"`,
      };
    }
  }

  // 3. Accent-forgiving match
  const strippedGiven = stripAccents(normGiven);
  for (const variant of variants) {
    if (strippedGiven === stripAccents(norm(variant))) {
      return {
        ok: true,
        isClose: true,
        expected: variant,
        matchedVariant: variant,
        hint: `Correct! Note accents: "${variant}"`,
      };
    }
  }

  // 4. Minor typo / near-miss tolerance for typed answers (distance <= 1 or 2 for long phrases)
  for (const variant of variants) {
    const normVar = norm(variant);
    const maxDistance = Math.max(1, Math.floor(normVar.length / 8));
    const dist = levenshteinDistance(strippedGiven, stripAccents(normVar));
    if (dist <= maxDistance) {
      return {
        ok: true,
        isClose: true,
        expected: variant,
        matchedVariant: variant,
        hint: `Almost perfect! Careful with spelling: "${variant}"`,
      };
    }
  }

  return { ok: false, expected: item.target };
}

/**
 * Selects close, plausible distractors from the same lesson or same CEFR level
 * with matching word count and grammatical complexity.
 */
export function selectPlausibleDistractors(
  course: Course,
  currentLessonItems: Item[],
  targetItem: Item,
  count = 3
): Item[] {
  const lesson = course.lessons.find((l) => l.items.some((i) => i.id === targetItem.id));
  const levelPrefix = lesson?.level?.split(' · ')[0] ?? 'A1';

  // 1. Same lesson candidates (same semantic topic, e.g. numbers, cafe, hotel)
  const sameLesson = (lesson ? lesson.items : currentLessonItems).filter((i) => i.id !== targetItem.id);

  // 2. Same CEFR level candidates (same difficulty tier)
  const sameLevel = course.lessons
    .filter((l) => l.level?.startsWith(levelPrefix))
    .flatMap((l) => l.items)
    .filter((i) => i.id !== targetItem.id && !sameLesson.some((s) => s.id === i.id));

  // Compute structural proximity score (lower = closer in word count and char length)
  const targetWords = targetItem.target.trim().split(/\s+/).length;
  const scoreProximity = (candidate: Item) => {
    const candWords = candidate.target.trim().split(/\s+/).length;
    const wordDiff = Math.abs(targetWords - candWords);
    const charDiff = Math.abs(targetItem.target.length - candidate.target.length);
    return wordDiff * 12 + charDiff;
  };

  const sortedSameLesson = shuffle(sameLesson).sort((a, b) => scoreProximity(a) - scoreProximity(b));
  const sortedSameLevel = shuffle(sameLevel).sort((a, b) => scoreProximity(a) - scoreProximity(b));

  const chosen: Item[] = [];

  for (const candidate of sortedSameLesson) {
    if (chosen.length >= count) break;
    chosen.push(candidate);
  }

  for (const candidate of sortedSameLevel) {
    if (chosen.length >= count) break;
    chosen.push(candidate);
  }

  if (chosen.length < count) {
    const fallback = course.lessons
      .flatMap((l) => l.items)
      .filter((i) => i.id !== targetItem.id && !chosen.some((c) => c.id === i.id));
    for (const candidate of shuffle(fallback)) {
      if (chosen.length >= count) break;
      chosen.push(candidate);
    }
  }

  return chosen.slice(0, count);
}

/**
 * Tokenizes a target phrase into clean word tokens, stripping surrounding punctuation.
 */
export function tokenizePhrase(target: string): string[] {
  return target
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/^[.,!?;:¿¡"']+|[.,!?;:¿¡"']+$/g, ''))
    .filter((word) => word.length > 0);
}

/**
 * Builds an interactive sentence scramble (word tiles) exercise.
 */
export function buildScrambleExercise(item: Item): Exercise {
  const originalTokens = tokenizePhrase(item.target);
  let shuffled = shuffle([...originalTokens]);

  // If shuffle randomly resulted in identical order and length > 1, rotate by 1
  if (shuffled.length > 1 && shuffled.join(' ') === originalTokens.join(' ')) {
    shuffled = [...shuffled.slice(1), shuffled[0]];
  }

  return {
    kind: 'scramble',
    item,
    tokens: shuffled,
  };
}

/**
 * Evaluates whether the user's selected word tile sequence matches the target phrase.
 */
export function evaluateScramble(selectedTokens: string[], item: Item): boolean {
  const userStr = norm(selectedTokens.join(' '));
  const targetStr = norm(item.target);
  if (userStr === targetStr) return true;

  if (item.alternatives) {
    for (const alt of item.alternatives) {
      if (userStr === norm(alt)) return true;
    }
  }

  return false;
}

/**
 * Scaffolding-first curriculum builder:
 * Follows the natural learning ladder from absolute beginner to fluency:
 * 1. Presentation: 'intro' (See & Hear the word first with phonetics/notes)
 * 2. Recognition: 'choice' (Choose the right translation from options)
 * 3. Guided Assembly: 'scramble' (Reconstruct sentences using word tiles)
 * 4. Comprehension: 'listen' (Listen to the phrase and transcribe)
 * 5. Pronunciation: 'speak' (Pronounce out loud with speech recognition)
 * 6. Production: 'type' (Translate from memory)
 */
export function buildExercises(course: Course, items: Item[], isReview = false): Exercise[] {
  const out: Exercise[] = [];

  // Group items into digestible chunks of 2 or 3 items
  const chunkSize = 2;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);

    // 1. First, introduce each new word in the chunk (unless it's an SRS review of known cards)
    if (!isReview) {
      for (const item of chunk) {
        out.push({ kind: 'intro', item });
      }
    }

    // 2. Recognition phase: Multiple-choice with close, plausible distractors
    for (const item of shuffle(chunk)) {
      const distractors = selectPlausibleDistractors(course, items, item, 3);
      out.push({
        kind: 'choice',
        item,
        options: shuffle([item, ...distractors]).map((p) => p.target),
      });
    }

    // 3. Guided assembly phase: Sentence Scramble (Word Tiles)
    for (const item of shuffle(chunk)) {
      out.push(buildScrambleExercise(item));
    }

    // 4. Listening comprehension phase
    for (const item of shuffle(chunk)) {
      out.push({ kind: 'listen', item });
    }

    // 5. Speaking practice phase: pronounce out loud with real speech recognition
    for (const item of shuffle(chunk)) {
      out.push({ kind: 'speak', item });
    }

    // 6. Active production phase: typing from recall
    for (const item of shuffle(chunk)) {
      out.push({ kind: 'type', item });
    }
  }

  return out;
}
