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
 * Builds representative question pools for A1, A2, B1, and B2 from course curriculum.
 */
export function buildPlacementQuestionPool(course: Course): PlacementQuestionPool {
  const poolByLevel: Record<CEFRLevel, Item[]> = {
    A1: course.lessons.slice(0, 5).flatMap((l) => l.items),
    A2: course.lessons.slice(5, 10).flatMap((l) => l.items),
    B1: course.lessons.slice(10, 15).flatMap((l) => l.items),
    B2: course.lessons.slice(15, 20).flatMap((l) => l.items),
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
 * Evaluates the learner's assessed CEFR placement level based on accuracy per tier.
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
 * - Unlocks prerequisite chapters
 * - Populates SM-2 cards with mature intervals
 * - Awards retroactive official Gold Diplomas
 * - Grants scaled XP placement bounty
 */
export function applyPlacementResult(
  progress: Progress,
  course: Course,
  placedLevel: CEFRLevel
): Progress {
  if (placedLevel === 'A1') {
    return progress;
  }

  const maxLessonIdx = placedLevel === 'A2' ? 5 : placedLevel === 'B1' ? 10 : 15;
  const unlockedLessons = course.lessons.slice(0, maxLessonIdx);

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
