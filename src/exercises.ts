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
 * Scaffolding-first curriculum builder:
 * Follows the natural learning ladder from absolute beginner to fluency:
 * 1. Presentation: 'intro' (See & Hear the word first with phonetics/notes)
 * 2. Recognition: 'choice' (Choose the right translation from options)
 * 3. Comprehension: 'listen' (Listen to the phrase and transcribe)
 * 4. Production: 'type' (Translate from memory)
 */
export function buildExercises(course: Course, items: Item[], isReview = false): Exercise[] {
  const pool = course.lessons.flatMap((l) => l.items);
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

    // 2. Recognition phase: Multiple-choice for chunk items
    for (const item of shuffle(chunk)) {
      const distractors = shuffle(pool.filter((p) => p.id !== item.id)).slice(0, 3);
      out.push({
        kind: 'choice',
        item,
        options: shuffle([item, ...distractors]).map((p) => p.target),
      });
    }

    // 3. Listening comprehension phase
    for (const item of shuffle(chunk)) {
      out.push({ kind: 'listen', item });
    }

    // 4. Active production phase: typing from recall
    for (const item of shuffle(chunk)) {
      out.push({ kind: 'type', item });
    }
  }

  return out;
}
