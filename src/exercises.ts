import { Course, Exercise, Item } from './types';

const shuffle = <T,>(a: T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

/** Normalise for answer checking: case, accents kept, punctuation and spacing ignored. */
export const norm = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?¿¡;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export function buildExercises(course: Course, items: Item[]): Exercise[] {
  const pool = course.lessons.flatMap((l) => l.items);
  const out: Exercise[] = [];
  for (const item of items) {
    const distractors = shuffle(pool.filter((p) => p.id !== item.id)).slice(0, 3);
    out.push({ kind: 'choice', item, options: shuffle([item, ...distractors]).map((i) => i.target) });
    out.push({ kind: 'listen', item });
    out.push({ kind: 'type', item });
  }
  return shuffle(out);
}
