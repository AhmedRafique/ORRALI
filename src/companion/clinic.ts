import { Course, Exercise, Item, MistakeDiagnosis, MistakeRecord } from '../types';

/**
 * Diagnoses error patterns from attempts and spaced repetition lapses.
 * Sorts problem items by highest failure volume and lowest accuracy.
 */
export function diagnoseMistakes(
  records: MistakeRecord[],
  allItems: Item[]
): MistakeDiagnosis[] {
  const itemMap = new Map<string, Item>();
  for (const item of allItems) {
    itemMap.set(item.id, item);
  }

  const diagnoses: MistakeDiagnosis[] = [];

  for (const record of records) {
    if (record.failCount <= 0) continue;
    const item = itemMap.get(record.itemId);
    if (!item) continue;

    const total = record.passCount + record.failCount;
    const accuracyPercent = Math.round((record.passCount / Math.max(1, total)) * 100);

    let suggestedTip = item.notes ?? '';
    if (!suggestedTip && item.alternatives && item.alternatives.length > 0) {
      suggestedTip = `Remember: you can also say "${item.alternatives[0]}".`;
    }
    if (!suggestedTip) {
      suggestedTip = `Focus on the exact spelling: "${item.target}".`;
    }

    diagnoses.push({
      item,
      failCount: record.failCount,
      passCount: record.passCount,
      accuracyPercent,
      suggestedTip,
    });
  }

  // Sort by lowest accuracy first, then highest fail count
  diagnoses.sort((a, b) => {
    if (a.accuracyPercent !== b.accuracyPercent) {
      return a.accuracyPercent - b.accuracyPercent;
    }
    return b.failCount - a.failCount;
  });

  return diagnoses;
}

/**
 * Builds a focused 5-minute remedial workout targeting problem items.
 */
export function buildRemedialWorkout(
  diagnoses: MistakeDiagnosis[],
  course: Course
): Exercise[] {
  // Take top 4 most challenging items
  const problemItems = diagnoses.slice(0, 4).map((d) => d.item);
  if (problemItems.length === 0) return [];

  const pool = course.lessons.flatMap((l) => l.items);
  const exercises: Exercise[] = [];

  for (const item of problemItems) {
    // 1. Listening comprehension drill
    exercises.push({ kind: 'listen', item });

    // 2. Choice drill with distractors
    const distractors = pool.filter((p) => p.id !== item.id).slice(0, 3);
    const options = [item.target, ...distractors.map((d) => d.target)].sort(
      () => Math.random() - 0.5
    );
    exercises.push({ kind: 'choice', item, options });

    // 3. Spoken drill
    exercises.push({ kind: 'speak', item });

    // 4. Final production recall
    exercises.push({ kind: 'type', item });
  }

  return exercises;
}
