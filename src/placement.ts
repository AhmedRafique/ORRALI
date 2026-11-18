import { selectPlausibleDistractors, shuffle } from './exercises';
import { CEFRLevel } from './milestones';
import { dayKey } from './streak';
import { Course, Item, Progress } from './types';

export interface PlacementQuestion {
  level: CEFRLevel;
  item: Item;
  prompt: string;
  options: string[];
}

export type PlacementQuestionPool = Record<CEFRLevel, PlacementQuestion[]>;

/**
 * Builds representative question pools for A1, A2, B1, and B2 from course curriculum
 * using authentic lesson.level metadata rather than fixed index offsets.
 */
export function buildPlacementQuestionPool(course: Course): PlacementQuestionPool {
  const poolByLevel: Record<CEFRLevel, Item[]> = {
    A1: course.lessons.filter((l) => !!l.level?.startsWith('A1')).flatMap((l) => l.items),
    A2: course.lessons.filter((l) => !!l.level?.startsWith('A2')).flatMap((l) => l.items),
    B1: course.lessons.filter((l) => !!l.level?.startsWith('B1')).flatMap((l) => l.items),
    B2: course.lessons.filter((l) => !!l.level?.startsWith('B2')).flatMap((l) => l.items),
  };

  const allItems = course.lessons.flatMap((l) => l.items);

  const result: PlacementQuestionPool = {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
  };

  for (const level of ['A1', 'A2', 'B1', 'B2'] as const) {
    const levelItems = shuffle(poolByLevel[level]).slice(0, 3);
    result[level] = levelItems.map((item) => {
      const distractors = selectPlausibleDistractors(course, allItems, item, 3);
      const options = shuffle([item.target, ...distractors.map((d) => d.target)]);
      return {
        level,
        item,
        prompt: `How do you say: "${item.en}"?`,
        options,
      };
    });
  }

  return result;
}

/**
 * Evaluates the learner's starting placement level based on accuracy per tier.
 * Passing tier N tests out of tier N and fast-tracks the learner to tier N+1:
 * - Passed A1 (>= 2/3) -> tests out of A1 -> places at A2
 * - Passed A1 & A2 (>= 2/3) -> tests out of A1 & A2 -> places at B1
 * - Passed A1, A2, & B1 (>= 2/3) -> tests out of A1, A2, B1 -> places at B2
 * - Failed A1 -> places at A1 (starts at the beginning)
 */
export function evaluatePlacementLevel(
  scoreByLevel: Record<CEFRLevel, number>
): CEFRLevel {
  const passedA1 = (scoreByLevel.A1 ?? 0) >= 2;
  const passedA2 = (scoreByLevel.A2 ?? 0) >= 2;
  const passedB1 = (scoreByLevel.B1 ?? 0) >= 2;

  if (passedA1 && passedA2 && passedB1) return 'B2';
  if (passedA1 && passedA2) return 'B1';
  if (passedA1) return 'A2';
  return 'A1';
}

/**
 * Applies placement test result to progress:
 * - Unlocks prerequisite chapters based on authentic lesson.level metadata
 * - Populates SM-2 cards with mature intervals (21 days)
 * - Awards retroactive official Gold Diplomas
 * - If B2 questions were also mastered (>= 2/3), awards B2 Gold Diploma
 * - Grants scaled XP placement bounty and syncs dailyXp
 */
export function applyPlacementResult(
  progress: Progress,
  course: Course,
  placedLevel: CEFRLevel,
  scoreByLevel?: Record<CEFRLevel, number>
): Progress {
  if (placedLevel === 'A1') {
    return progress;
  }

  // Derive unlocked lessons dynamically from lesson.level metadata
  const unlockedLessons = course.lessons.filter((l) => {
    if (placedLevel === 'A2') return !!l.level?.startsWith('A1');
    if (placedLevel === 'B1') return !!l.level?.startsWith('A1') || !!l.level?.startsWith('A2');
    if (placedLevel === 'B2')
      return (
        !!l.level?.startsWith('A1') ||
        !!l.level?.startsWith('A2') ||
        !!l.level?.startsWith('B1')
      );
    return false;
  });

  const completed = { ...(progress.completed ?? {}) };
  const cards = { ...(progress.cards ?? {}) };
  const diplomas = { ...(progress.diplomas ?? {}) };

  for (const lesson of unlockedLessons) {
    completed[lesson.id] = true;
    for (const item of lesson.items) {
      if (!cards[item.id] || cards[item.id].interval < 21) {
        cards[item.id] = {
          due: Date.now() + 21 * 24 * 60 * 60 * 1000,
          interval: 21,
          ease: 2.6,
          reps: 5,
          lapses: 0,
          lastReviewed: Date.now(),
        };
      }
    }
  }

  // Award retroactive diplomas
  if (placedLevel === 'A2' || placedLevel === 'B1' || placedLevel === 'B2') {
    diplomas[`${course.code}-A1`] = diplomas[`${course.code}-A1`] ?? Date.now();
  }
  if (placedLevel === 'B1' || placedLevel === 'B2') {
    diplomas[`${course.code}-A2`] = diplomas[`${course.code}-A2`] ?? Date.now();
  }
  if (placedLevel === 'B2') {
    diplomas[`${course.code}-B1`] = diplomas[`${course.code}-B1`] ?? Date.now();
  }
  // If B2 questions were also mastered (>= 2/3), award B2 Gold Diploma!
  if (scoreByLevel && (scoreByLevel.B2 ?? 0) >= 2) {
    diplomas[`${course.code}-B2`] = diplomas[`${course.code}-B2`] ?? Date.now();
  }

  const xpBounty = placedLevel === 'A2' ? 75 : placedLevel === 'B1' ? 150 : 250;
  const today = dayKey(new Date());
  const dailyXp = (progress.dailyXpDay === today ? progress.dailyXp : 0) + xpBounty;

  return {
    ...progress,
    completed,
    cards,
    diplomas,
    xp: progress.xp + xpBounty,
    courseXp: {
      ...(progress.courseXp ?? {}),
      [course.code]: (progress.courseXp?.[course.code] ?? 0) + xpBounty,
    },
    dailyXp,
    dailyXpDay: today,
  };
}
